import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { PipelineUpdatedEvent } from '../../domain/events/pipeline-updated.event.js';

@Injectable()
export class PipelineUpdatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(PipelineUpdatedEvent, this.handle.bind(this));
  }

  private async handle(event: PipelineUpdatedEvent): Promise<void> {
    console.debug(`[PipelineUpdatedEvent] Pipeline ${event.pipelineId} was updated`);
  }
}
