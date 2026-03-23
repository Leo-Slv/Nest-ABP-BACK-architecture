import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { DealCreatedEvent } from '../../domain/events/deal-created.event.js';

@Injectable()
export class DealCreatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(DealCreatedEvent, this.handle.bind(this));
  }

  private async handle(event: DealCreatedEvent): Promise<void> {
    console.debug(`[DealCreatedEvent] Deal ${event.dealId} was created`);
  }
}
