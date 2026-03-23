import { Inject, Injectable } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ContactNotFoundError } from '../../../../shared/errors/contact-not-found.error.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';

@Injectable()
export class DeleteContactUseCase {
  constructor(
    @Inject('IContactRepository') private readonly repository: IContactRepository,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string): Promise<void> {
    const contact = await this.repository.findById(id);
    if (!contact) {
      throw new ContactNotFoundError(id);
    }
    contact.markDeleted();
    const events = contact.getDomainEvents();
    await this.eventDispatcher.dispatch(events);
    await this.repository.delete(id);
  }
}
