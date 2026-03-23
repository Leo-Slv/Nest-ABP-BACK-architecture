import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { LeadUpdatedEvent } from '../../domain/events/lead-updated.event.js';

/**
 * Handles LeadUpdatedEvent (analytics, sync, denormalized views, etc.).
 */
@Injectable()
export class LeadUpdatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(LeadUpdatedEvent, this.handle.bind(this));
  }

  private async handle(event: LeadUpdatedEvent): Promise<void> {
    console.debug(`[LeadUpdatedEvent] Lead ${event.leadId} was updated`);
  }
}
