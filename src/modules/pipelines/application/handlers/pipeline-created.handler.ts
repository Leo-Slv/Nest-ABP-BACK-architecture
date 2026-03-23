import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { PipelineCreatedEvent } from '../../domain/events/pipeline-created.event.js';

@Injectable()
export class PipelineCreatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(PipelineCreatedEvent, this.handle.bind(this));
  }

  private async handle(event: PipelineCreatedEvent): Promise<void> {
    console.debug(`[PipelineCreatedEvent] Pipeline ${event.pipelineId} was created`);
  }
}
