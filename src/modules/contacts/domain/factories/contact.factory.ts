import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Email } from '../../../../shared/domain/value-objects/email.vo.js';
import { Phone } from '../../../../shared/domain/value-objects/phone.vo.js';
import { Contact } from '../entities/contact.entity.js';

export type CreateContactInput = {
  name: Name;
  email: Email;
  phone?: Phone | null;
  role?: string | null;
  companyId?: string | null;
};

/**
 * Factory para criação do agregado `Contact`.
 * Centraliza a composição inicial (VOs -> props) e chama `Contact.createNew`.
 */
export class ContactFactory {
  create(input: CreateContactInput): Contact {
    return Contact.createNew({
      name: input.name.value,
      email: input.email.value,
      phone: input.phone?.value ?? null,
      role: input.role ?? null,
      companyId: input.companyId ?? null,
    });
  }
}

