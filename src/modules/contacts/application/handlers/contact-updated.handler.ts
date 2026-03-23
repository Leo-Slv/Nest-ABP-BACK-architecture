import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ContactUpdatedEvent } from '../../domain/events/contact-updated.event.js';

@Injectable()
export class ContactUpdatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(ContactUpdatedEvent, this.handle.bind(this));
  }

  private async handle(event: ContactUpdatedEvent): Promise<void> {
    console.debug(`[ContactUpdatedEvent] Contact ${event.contactId} was updated`);
  }
}
