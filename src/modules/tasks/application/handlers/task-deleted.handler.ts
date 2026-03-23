import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { TaskDeletedEvent } from '../../domain/events/task-deleted.event.js';

@Injectable()
export class TaskDeletedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(TaskDeletedEvent, this.handle.bind(this));
  }

  private async handle(event: TaskDeletedEvent): Promise<void> {
    console.debug(`[TaskDeletedEvent] Task ${event.taskId} was deleted`);
  }
}
