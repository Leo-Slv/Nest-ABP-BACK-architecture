import { Contact } from '../../domain/entities/contact.entity.js';
import type { Contact as PrismaContact } from '@prisma/client';

export class ContactMapper {
  static toDomain(row: PrismaContact): Contact {
    return Contact.reconstitute({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone ?? null,
      role: row.role ?? null,
      companyId: row.companyId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(contact: Contact): PrismaContact {
    const p = contact.toPersistence();
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone ?? null,
      role: p.role ?? null,
      companyId: p.companyId ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
