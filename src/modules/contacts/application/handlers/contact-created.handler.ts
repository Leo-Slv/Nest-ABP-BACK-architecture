import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ContactCreatedEvent } from '../../domain/events/contact-created.event.js';

@Injectable()
export class ContactCreatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(ContactCreatedEvent, this.handle.bind(this));
  }

  private async handle(event: ContactCreatedEvent): Promise<void> {
    console.debug(`[ContactCreatedEvent] Contact ${event.contactId} was created`);
  }
}
