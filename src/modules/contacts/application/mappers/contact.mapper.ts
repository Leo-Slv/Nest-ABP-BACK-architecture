import { Contact } from '../../domain/entities/contact.entity.js';
import type { Contact as PrismaContact } from '@prisma/client';

export class ContactMapper {
  static toDomain(prisma: PrismaContact): Contact {
    return Contact.reconstitute({
      id: prisma.id,
      name: prisma.name,
      email: prisma.email,
      phone: prisma.phone ?? null,
      role: prisma.role ?? null,
      companyId: prisma.companyId ?? null,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPersistence(contact: Contact): Omit<PrismaContact, 'createdAt' | 'updatedAt'> & { createdAt: Date; updatedAt: Date } {
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
