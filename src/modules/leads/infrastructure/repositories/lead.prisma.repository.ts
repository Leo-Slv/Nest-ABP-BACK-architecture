import { Injectable } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { PrismaService } from '../../../../shared/database/prisma.service.js';
import { LeadMapper } from '../../application/mappers/lead.mapper.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';
import type {
  ILeadRepository,
  ListLeadsParams,
  ListLeadsResult,
} from '../../domain/repositories/lead.repository.js';
import type { Prisma } from '@prisma/client';
import { Lead } from '../../domain/entities/lead.entity.js';

@Injectable()
export class LeadPrismaRepository implements ILeadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    phone?: string | null;
    source?: string | null;
    status?: LeadStatus;
    notes?: string | null;
  }): Promise<Lead> {
    const created = await this.prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        source: data.source ?? null,
        status: data.status ?? LeadStatus.NEW,
        notes: data.notes ?? null,
      },
    });
    return LeadMapper.toDomain(created);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string | null;
      source: string | null;
      status: LeadStatus;
      notes: string | null;
      contactId: string | null;
      convertedAt: Date | null;
    }>,
  ): Promise<Lead> {
    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.contactId !== undefined && { contactId: data.contactId }),
        ...(data.convertedAt !== undefined && { convertedAt: data.convertedAt }),
      },
    });
    return LeadMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lead.delete({ where: { id } });
  }

  async findById(id: string): Promise<Lead | null> {
    const found = await this.prisma.lead.findUnique({ where: { id } });
    return found ? LeadMapper.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const found = await this.prisma.lead.findFirst({ where: { email } });
    return found ? LeadMapper.toDomain(found) : null;
  }

  async list(params: ListLeadsParams): Promise<ListLeadsResult> {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: data.map((l) => LeadMapper.toDomain(l)),
      total,
      page,
      limit,
    };
  }

  async convert(leadId: string): Promise<Lead> {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id: leadId } });
      if (!lead) {
        throw new NotFoundError(`Lead ${leadId} não encontrado`);
      }
      if (lead.status === LeadStatus.CONVERTED) {
        throw new ConflictError(`Lead ${leadId} já foi convertido`);
      }

      const contact = await tx.contact.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
        },
      });

      const updated = await tx.lead.update({
        where: { id: leadId },
        data: {
          status: LeadStatus.CONVERTED,
          contactId: contact.id,
          convertedAt: new Date(),
        },
      });

      return LeadMapper.toDomain(updated);
    });
  }
}
