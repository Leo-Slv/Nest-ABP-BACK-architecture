import { Contact } from '../../domain/entities/contact.entity.js';

export type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ContactMapper {
  static toDomain(prisma: ContactRow): Contact {
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

  static toPersistence(contact: Contact): ContactRow {
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
