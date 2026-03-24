import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { ContactNotFoundError } from '../../../../shared/errors/contact-not-found.error.js';
import { ContactRepositoryFactory } from '../../infrastructure/repositories/contact.repository.factory.js';

@Injectable()
export class DeleteContactUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly contactRepositoryFactory: ContactRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string): Promise<void> {
    const events: DomainEvent[] = [];

    await this.uow.execute(async (ctx) => {
      const repository = this.contactRepositoryFactory.create(ctx);
      const contact = await repository.findById(id);
      if (!contact) {
        throw new ContactNotFoundError(id);
      }
      contact.markDeleted();
      events.push(...contact.getDomainEvents());
      await repository.delete(id);
    });

    await this.eventDispatcher.dispatch(events);
  }
}
