import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { ContactNotFoundError } from '../../../../shared/errors/contact-not-found.error.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { Phone } from '../../domain/value-objects/phone.vo.js';
import { ContactEmailUniqueSpec } from '../../domain/specifications/contact-email-unique.specification.js';
import { ContactRepositoryFactory } from '../../infrastructure/repositories/contact.repository.factory.js';
import type { UpdateContactDto } from '../dtos/update-contact.dto.js';

@Injectable()
export class UpdateContactUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly contactRepositoryFactory: ContactRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateContactDto): Promise<Contact> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.contactRepositoryFactory.create(ctx);
      const contact = await repository.findById(id);
      if (!contact) {
        throw new ContactNotFoundError(id);
      }

      if (dto.email && dto.email !== contact.email) {
        const spec = new ContactEmailUniqueSpec(repository);
        const emailUnique = await spec.isSatisfiedBy(new Email(dto.email), id);
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

      const out = await repository.update(contact);
      events.push(...contact.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
