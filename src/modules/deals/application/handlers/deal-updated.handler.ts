import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { DealUpdatedEvent } from '../../domain/events/deal-updated.event.js';

@Injectable()
export class DealUpdatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(DealUpdatedEvent, this.handle.bind(this));
  }

  private async handle(event: DealUpdatedEvent): Promise<void> {
    console.debug(`[DealUpdatedEvent] Deal ${event.dealId} was updated`);
  }
}
