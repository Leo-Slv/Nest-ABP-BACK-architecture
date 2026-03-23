import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import { Lead } from '../entities/lead.entity.js';
import { LeadSource } from '../value-objects/lead-source.vo.js';
import { LeadStatus } from '../enums/lead-status.enum.js';

/**
 * Factory for creating Lead aggregates.
 */
export class LeadFactory {
  create(input: CreateLeadInput): Lead {
    const nameVO = new Name(input.name);
    const emailVO = new Email(input.email);
    const phoneVO = input.phone ? new Phone(input.phone) : null;
    const sourceVO = input.source ? new LeadSource(input.source) : null;

    return Lead.create({
      name: nameVO,
      email: emailVO,
      phone: phoneVO,
      source: sourceVO,
      status: input.status,
      notes: input.notes,
    });
  }
}

export type CreateLeadInput = {
    name: string;
    email: string;
    phone?: string | null;
    source?: string | null;
    status?: LeadStatus;
    notes?: string | null;
};
