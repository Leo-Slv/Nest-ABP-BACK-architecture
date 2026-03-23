import type { ILeadRepository } from '../repositories/lead.repository.js';

/**
 * Specification: Lead email must be unique.
 * Used for validation before creating or updating a lead.
 */
export class LeadEmailUniqueSpec {
  constructor(private readonly repository: ILeadRepository) {}

  async isSatisfiedBy(email: string, excludeLeadId?: string): Promise<boolean> {
    const existing = await this.repository.findByEmail(email);
    if (!existing) return true;
    if (excludeLeadId && existing.id === excludeLeadId) return true;
    return false;
  }

  async isViolatedBy(email: string, excludeLeadId?: string): Promise<boolean> {
    return !(await this.isSatisfiedBy(email, excludeLeadId));
  }
}
