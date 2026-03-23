import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';
import { LeadSource } from '../../domain/value-objects/lead-source.vo.js';
import type { Lead as PrismaLead } from '@prisma/client';

export class LeadMapper {
  static toDomain(prisma: PrismaLead): Lead {
    const name = new Name(prisma.name);
    const email = new Email(prisma.email);
    const phone = prisma.phone ? new Phone(prisma.phone) : null;
    const source = prisma.source ? new LeadSource(prisma.source) : null;

    return Lead.reconstitute({
      id: prisma.id,
      name,
      email,
      phone,
      source,
      status: prisma.status as LeadStatus,
      notes: prisma.notes ?? null,
      convertedAt: prisma.convertedAt ?? null,
      contactId: prisma.contactId ?? null,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }
}
