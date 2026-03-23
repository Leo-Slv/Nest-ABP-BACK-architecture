import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { TaskNotFoundError } from '../../../../shared/errors/task-not-found.error.js';
import { Task } from '../../domain/entities/task.entity.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';

@Injectable()
export class CompleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }
    task.markComplete();
    const saved = await this.repository.update(task);
    await this.eventDispatcher.dispatch(task.getDomainEvents());
    return saved;
  }
}
