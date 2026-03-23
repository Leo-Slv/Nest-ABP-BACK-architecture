import { Inject, Injectable } from '@nestjs/common';
import { ContactNotFoundError } from '../../../../shared/errors/contact-not-found.error.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';

@Injectable()
export class FindContactUseCase {
  constructor(@Inject('IContactRepository') private readonly repository: IContactRepository) {}

  async execute(id: string): Promise<Contact> {
    const contact = await this.repository.findById(id);
    if (!contact) {
      throw new ContactNotFoundError(id);
    }
    return contact;
  }
}
