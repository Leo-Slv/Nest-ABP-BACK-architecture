import { Inject, Injectable } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { Phone } from '../../domain/value-objects/phone.vo.js';
import { ContactFactory } from '../../domain/factories/contact.factory.js';
import { ContactEmailUniqueSpec } from '../../domain/specifications/contact-email-unique.specification.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';
import type { CreateContactDto } from '../dtos/create-contact.dto.js';

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject('IContactRepository') private readonly repository: IContactRepository,
    private readonly emailUniqueSpec: ContactEmailUniqueSpec,
    private readonly factory: ContactFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateContactDto): Promise<Contact> {
    const name = new Name(dto.name);
    const email = new Email(dto.email);
    const emailUnique = await this.emailUniqueSpec.isSatisfiedBy(email);
    if (!emailUnique) {
      throw new ConflictError(`Contato com email ${dto.email} já existe`);
    }

    const phone = dto.phone ? new Phone(dto.phone) : null;

    const contact = this.factory.create({
      name,
      email,
      phone,
      role: dto.role ?? null,
      companyId: dto.companyId ?? null,
    });

    const saved = await this.repository.create(contact);
    const events = contact.getDomainEvents();
    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
