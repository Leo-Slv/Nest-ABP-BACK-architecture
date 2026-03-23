import { Inject, Injectable } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { ContactNotFoundError } from '../../../../shared/errors/contact-not-found.error.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { Phone } from '../../domain/value-objects/phone.vo.js';
import { ContactEmailUniqueSpec } from '../../domain/specifications/contact-email-unique.specification.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';
import type { UpdateContactDto } from '../dtos/update-contact.dto.js';

@Injectable()
export class UpdateContactUseCase {
  constructor(
    @Inject('IContactRepository') private readonly repository: IContactRepository,
    private readonly emailUniqueSpec: ContactEmailUniqueSpec,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.repository.findById(id);
    if (!contact) {
      throw new ContactNotFoundError(id);
    }

    if (dto.email && dto.email !== contact.email) {
      const emailUnique = await this.emailUniqueSpec.isSatisfiedBy(
        new Email(dto.email),
        id,
      );
      if (!emailUnique) {
        throw new ConflictError(`Contato com email ${dto.email} já existe`);
      }
    }

    const email = dto.email ? new Email(dto.email).value : contact.email;
    const phone =
      dto.phone !== undefined
        ? dto.phone
          ? new Phone(dto.phone).value
          : null
        : contact.phone;
    const name =
      dto.name !== undefined ? new Name(dto.name).value : contact.name;

    contact.applyUpdate({
      name,
      email,
      phone,
      role: dto.role !== undefined ? dto.role : contact.role,
      companyId:
        dto.companyId !== undefined ? dto.companyId : contact.companyId,
    });

    const saved = await this.repository.update(contact);
    const events = contact.getDomainEvents();
    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
