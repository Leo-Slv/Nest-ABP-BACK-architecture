import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Contact } from '../../domain/entities/contact.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { Phone } from '../../domain/value-objects/phone.vo.js';
import { ContactFactory } from '../../domain/factories/contact.factory.js';
import { ContactEmailUniqueSpec } from '../../domain/specifications/contact-email-unique.specification.js';
import { ContactRepositoryFactory } from '../../infrastructure/repositories/contact.repository.factory.js';
import type { CreateContactDto } from '../dtos/create-contact.dto.js';

@Injectable()
export class CreateContactUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly contactRepositoryFactory: ContactRepositoryFactory,
    private readonly factory: ContactFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateContactDto): Promise<Contact> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.contactRepositoryFactory.create(ctx);
      const email = new Email(dto.email);
      const spec = new ContactEmailUniqueSpec(repository);
      const emailUnique = await spec.isSatisfiedBy(email);
      if (!emailUnique) {
        throw new ConflictError(`Contato com email ${dto.email} já existe`);
      }

      const name = new Name(dto.name);
      const phone = dto.phone ? new Phone(dto.phone) : null;

      const contact = this.factory.create({
        name,
        email,
        phone,
        role: dto.role ?? null,
        companyId: dto.companyId ?? null,
      });

      const out = await repository.create(contact);
      events.push(...contact.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
