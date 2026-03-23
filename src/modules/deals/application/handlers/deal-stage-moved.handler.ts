import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { DealStageMovedEvent } from '../../domain/events/deal-stage-moved.event.js';

@Injectable()
export class DealStageMovedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(DealStageMovedEvent, this.handle.bind(this));
  }

  private async handle(event: DealStageMovedEvent): Promise<void> {
    console.debug(`[DealStageMovedEvent] Deal ${event.dealId} moved to ${event.stage}`);
  }
}
