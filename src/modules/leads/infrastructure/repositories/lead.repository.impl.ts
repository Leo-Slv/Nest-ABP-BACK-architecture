import { randomUUID } from 'node:crypto';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { LeadMapper } from '../../application/mappers/lead.mapper.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';
import type {
  ILeadRepository,
  ListLeadsParams,
  ListLeadsResult,
} from '../../domain/repositories/lead.repository.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import { Prisma } from '@prisma/client';

export class LeadSqlRepository implements ILeadRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(lead: Lead): Promise<Lead> {
    const d = lead.toPersistence();
    const created = await this.ctx.prisma.lead.create({
      data: {
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        source: d.source,
        status: d.status,
        notes: d.notes,
        convertedAt: d.convertedAt,
        contactId: d.contactId,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
    });
    return LeadMapper.toDomain(created);
  }

  async update(lead: Lead): Promise<Lead> {
    const d = lead.toPersistence();
    try {
      const updated = await this.ctx.prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: d.name,
          email: d.email,
          phone: d.phone,
          source: d.source,
          status: d.status,
          notes: d.notes,
          convertedAt: d.convertedAt,
          contactId: d.contactId,
          updatedAt: d.updatedAt,
        },
      });
      return LeadMapper.toDomain(updated);
    } catch {
      throw new NotFoundError(`Lead ${lead.id} não encontrado`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.ctx.prisma.lead.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`Lead ${id} não encontrado`);
    }
  }

  async findById(id: string): Promise<Lead | null> {
    const row = await this.ctx.prisma.lead.findUnique({ where: { id } });
    return row ? LeadMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const row = await this.ctx.prisma.lead.findUnique({ where: { email } });
    return row ? LeadMapper.toDomain(row) : null;
  }

  async list(params: ListLeadsParams): Promise<ListLeadsResult> {
    const { page, limit, search, status } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.LeadWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
    };

    const [total, rows] = await Promise.all([
      this.ctx.prisma.lead.count({ where }),
      this.ctx.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => LeadMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }

  async convert(leadId: string): Promise<Lead> {
    const lead = await this.ctx.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, name: true, email: true, phone: true, status: true },
    });
    if (!lead) {
      throw new NotFoundError(`Lead ${leadId} não encontrado`);
    }
    if (lead.status === LeadStatus.CONVERTED) {
      throw new ConflictError(`Lead ${leadId} já foi convertido`);
    }

    const contactId = randomUUID();

    // Compare-and-set (CAS): only one transaction can convert a given lead.
    // This replaces "SELECT ... FOR UPDATE" without using raw SQL.
    const updatedCount = await this.ctx.prisma.lead.updateMany({
      where: {
        id: leadId,
        status: { not: LeadStatus.CONVERTED },
      },
      data: {
        status: LeadStatus.CONVERTED,
        contactId,
        convertedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (updatedCount.count === 0) {
      // Lead exists (we read it above), so this can only mean it was converted concurrently.
      throw new ConflictError(`Lead ${leadId} já foi convertido`);
    }

    await this.ctx.prisma.contact.create({
      data: {
        id: contactId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        role: null,
        companyId: null,
      },
    });

    const updated = await this.ctx.prisma.lead.findUnique({ where: { id: leadId } });
    if (!updated) {
      throw new NotFoundError(`Lead ${leadId} não encontrado`);
    }
    return LeadMapper.toDomain(updated);
  }
}
