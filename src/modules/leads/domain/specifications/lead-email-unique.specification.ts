import type { ILeadRepository } from '../repositories/lead.repository.js';
import type { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import type { Specification } from '../../../../shared/domain/specification.js';

/**
 * Specification: Lead email must be unique.
 * Used for validation before creating or updating a lead.
 */
export class LeadEmailUniqueSpec implements Specification<Email> {
  constructor(private readonly repository: ILeadRepository) {}

  async isSatisfiedBy(email: Email, excludeLeadId?: string): Promise<boolean> {
    const existing = await this.repository.findByEmail(email.value);
    if (!existing) return true;
    if (excludeLeadId && existing.id === excludeLeadId) return true;
    return false;
  }

  async isViolatedBy(email: Email, excludeLeadId?: string): Promise<boolean> {
    return !(await this.isSatisfiedBy(email, excludeLeadId));
  }
}
