import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service.js';
import { ContactMapper } from '../../application/mappers/contact.mapper.js';
import type {
  IContactRepository,
  ListContactsParams,
  ListContactsResult,
} from '../../domain/repositories/contact.repository.js';
import { Contact } from '../../domain/entities/contact.entity.js';

@Injectable()
export class ContactPrismaRepository implements IContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    email: string;
    phone?: string | null;
    role?: string | null;
    companyId?: string | null;
  }): Promise<Contact> {
    const created = await this.prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        role: data.role ?? null,
        companyId: data.companyId ?? null,
      },
    });
    return ContactMapper.toDomain(created);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string | null;
      role: string | null;
      companyId: string | null;
    }>,
  ): Promise<Contact> {
    const updated = await this.prisma.contact.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
      },
    });
    return ContactMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contact.delete({ where: { id } });
  }

  async findById(id: string): Promise<Contact | null> {
    const found = await this.prisma.contact.findUnique({ where: { id } });
    return found ? ContactMapper.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const found = await this.prisma.contact.findUnique({ where: { email } });
    return found ? ContactMapper.toDomain(found) : null;
  }

  async list(params: ListContactsParams): Promise<ListContactsResult> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: data.map((c) => ContactMapper.toDomain(c)),
      total,
      page,
      limit,
    };
  }
}
