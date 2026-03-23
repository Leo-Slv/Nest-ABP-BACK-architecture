import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { TaskCompletedEvent } from '../../domain/events/task-completed.event.js';

@Injectable()
export class TaskCompletedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(TaskCompletedEvent, this.handle.bind(this));
  }

  private async handle(event: TaskCompletedEvent): Promise<void> {
    console.debug(`[TaskCompletedEvent] Task ${event.taskId} was completed`);
  }
}
