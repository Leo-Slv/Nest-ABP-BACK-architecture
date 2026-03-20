import { Lead } from '../../domain/entities/lead.entity.js';
import type { Lead as PrismaLead } from '@prisma/client';

export class LeadMapper {
  static toDomain(prisma: PrismaLead): Lead {
    return Lead.create({
      id: prisma.id,
      name: prisma.name,
      email: prisma.email,
      phone: prisma.phone ?? null,
      source: prisma.source ?? null,
      status: prisma.status as Lead['props']['status'],
      notes: prisma.notes ?? null,
      convertedAt: prisma.convertedAt ?? null,
      contactId: prisma.contactId ?? null,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }
}
