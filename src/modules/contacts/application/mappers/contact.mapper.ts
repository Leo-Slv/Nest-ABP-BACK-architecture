import { Contact } from '../../domain/entities/contact.entity.js';
import type { Contact as PrismaContact } from '@prisma/client';

export class ContactMapper {
  static toDomain(prisma: PrismaContact): Contact {
    return Contact.create({
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
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone ?? null,
      role: contact.role ?? null,
      companyId: contact.companyId ?? null,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
