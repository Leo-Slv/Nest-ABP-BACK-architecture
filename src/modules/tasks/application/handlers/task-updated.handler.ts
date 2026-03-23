import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { TaskUpdatedEvent } from '../../domain/events/task-updated.event.js';

@Injectable()
export class TaskUpdatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(TaskUpdatedEvent, this.handle.bind(this));
  }

  private async handle(event: TaskUpdatedEvent): Promise<void> {
    console.debug(`[TaskUpdatedEvent] Task ${event.taskId} was updated`);
  }
}
