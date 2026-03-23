import type { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import type { Specification } from '../../../../shared/domain/specification.js';
import type { IContactRepository } from '../repositories/contact.repository.js';

export class ContactEmailUniqueSpec implements Specification<Email> {
  constructor(private readonly repository: IContactRepository) {}

  async isSatisfiedBy(email: Email, excludeContactId?: string): Promise<boolean> {
    const existing = await this.repository.findByEmail(email.value);
    if (!existing) return true;
    if (excludeContactId && existing.id === excludeContactId) return true;
    return false;
  }
}
