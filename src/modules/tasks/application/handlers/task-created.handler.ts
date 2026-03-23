import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { TaskCreatedEvent } from '../../domain/events/task-created.event.js';

@Injectable()
export class TaskCreatedEventHandler implements OnModuleInit {
  constructor(
    @Inject('IDomainEventDispatcher')
    private readonly dispatcher: IDomainEventDispatcher,
  ) {}

  onModuleInit(): void {
    this.dispatcher.registerHandler(TaskCreatedEvent, this.handle.bind(this));
  }

  private async handle(event: TaskCreatedEvent): Promise<void> {
    console.debug(`[TaskCreatedEvent] Task ${event.taskId} was created`);
  }
}
