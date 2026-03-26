import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { ContactMapper } from '../../application/mappers/contact.mapper.js';
import type {
  IContactRepository,
  ListContactsParams,
  ListContactsResult,
} from '../../domain/repositories/contact.repository.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import { Prisma } from '@prisma/client';

export class ContactSqlRepository implements IContactRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(contact: Contact): Promise<Contact> {
    const d = ContactMapper.toPersistence(contact);
    const created = await this.ctx.prisma.contact.create({
      data: {
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        role: d.role,
        companyId: d.companyId,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
    });
    return ContactMapper.toDomain(created);
  }

  async update(contact: Contact): Promise<Contact> {
    const d = ContactMapper.toPersistence(contact);
    try {
      const updated = await this.ctx.prisma.contact.update({
        where: { id: contact.id },
        data: {
          name: d.name,
          email: d.email,
          phone: d.phone,
          role: d.role,
          companyId: d.companyId,
          updatedAt: d.updatedAt,
        },
      });
      return ContactMapper.toDomain(updated);
    } catch {
      throw new NotFoundError(`Contato ${contact.id} não encontrado`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.ctx.prisma.contact.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`Contato ${id} não encontrado`);
    }
  }

  async findById(id: string): Promise<Contact | null> {
    const row = await this.ctx.prisma.contact.findUnique({ where: { id } });
    return row ? ContactMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const row = await this.ctx.prisma.contact.findUnique({ where: { email } });
    return row ? ContactMapper.toDomain(row) : null;
  }

  async list(params: ListContactsParams): Promise<ListContactsResult> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.ContactWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, rows] = await Promise.all([
      this.ctx.prisma.contact.count({ where }),
      this.ctx.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => ContactMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}
