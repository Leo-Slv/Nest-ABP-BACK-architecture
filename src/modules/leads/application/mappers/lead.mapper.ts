import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';
import { LeadSource } from '../../domain/value-objects/lead-source.vo.js';
/** Row shape from PostgreSQL `"Lead"` (Prisma-generated schema). */
export type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  convertedAt: Date | null;
  contactId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class LeadMapper {
  static toDomain(prisma: LeadRow): Lead {
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
      status: prisma.status as unknown as LeadStatus,
      notes: prisma.notes ?? null,
      convertedAt: prisma.convertedAt ?? null,
      contactId: prisma.contactId ?? null,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }
}
