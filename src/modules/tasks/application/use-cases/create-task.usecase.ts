import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { Task } from '../../domain/entities/task.entity.js';
import { TaskFactory } from '../../domain/factories/task.factory.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';
import type { CreateTaskDto } from '../dtos/create-task.dto.js';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
    private readonly factory: TaskFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const task = this.factory.create(dto);

    const saved = await this.repository.create(task);
    await this.eventDispatcher.dispatch(task.getDomainEvents());
    return saved;
  }
}
