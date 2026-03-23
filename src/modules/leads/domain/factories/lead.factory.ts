import { Email } from '../../../contacts/domain/value-objects/email.vo.js';
import { Phone } from '../../../contacts/domain/value-objects/phone.vo.js';
import { Lead } from '../entities/lead.entity.js';
import { LeadSource } from '../value-objects/lead-source.vo.js';
import { LeadStatus } from '../enums/lead-status.enum.js';

/**
 * Factory for creating Lead aggregates.
 * Encapsulates complex creation logic and value object validation.
 */
export class LeadFactory {
  create(props: {
    name: string;
    email: string;
    phone?: string | null;
    source?: string | null;
    status?: LeadStatus;
    notes?: string | null;
  }): Lead {
    const emailVO = new Email(props.email);
    const phoneVO = props.phone ? new Phone(props.phone) : null;
    const sourceVO = props.source ? new LeadSource(props.source) : null;

    return Lead.create({
      name: props.name,
      email: emailVO,
      phone: phoneVO,
      source: sourceVO,
      status: props.status,
      notes: props.notes,
    });
  }
}
