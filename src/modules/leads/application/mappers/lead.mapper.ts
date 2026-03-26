import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import type { Lead as PrismaLead } from '@prisma/client';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';
import { LeadSource } from '../../domain/value-objects/lead-source.vo.js';

export class LeadMapper {
  static toDomain(row: PrismaLead): Lead {
    const name = new Name(row.name);
    const email = new Email(row.email);
    const phone = row.phone ? new Phone(row.phone) : null;
    const source = row.source ? new LeadSource(row.source) : null;

    return Lead.reconstitute({
      id: row.id,
      name,
      email,
      phone,
      source,
      status: row.status as unknown as LeadStatus,
      notes: row.notes ?? null,
      convertedAt: row.convertedAt ?? null,
      contactId: row.contactId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
