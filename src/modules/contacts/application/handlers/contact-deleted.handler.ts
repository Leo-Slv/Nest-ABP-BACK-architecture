import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ContactDeletedEvent } from '../../domain/events/contact-deleted.event.js';

@Injectable()
export class ContactDeletedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(ContactDeletedEvent, this.handle.bind(this));
  }

  private async handle(event: ContactDeletedEvent): Promise<void> {
    console.debug(`[ContactDeletedEvent] Contact ${event.contactId} was deleted`);
  }
}
