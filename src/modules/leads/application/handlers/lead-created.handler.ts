import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { LeadCreatedEvent } from '../../domain/events/lead-created.event.js';

/**
 * Handles LeadCreatedEvent.
 * Example: could trigger welcome email, analytics, etc.
 */
@Injectable()
export class LeadCreatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(
      LeadCreatedEvent,
      this.handle.bind(this),
    );
  }

  private async handle(event: LeadCreatedEvent): Promise<void> {
    // Domain event handler - e.g. send welcome email, sync to analytics
    console.debug(`[LeadCreatedEvent] Lead ${event.leadId} was created`);
  }
}
