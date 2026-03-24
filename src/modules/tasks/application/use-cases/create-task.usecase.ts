import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { Task } from '../../domain/entities/task.entity.js';
import { TaskFactory } from '../../domain/factories/task.factory.js';
import { TaskRepositoryFactory } from '../../infrastructure/repositories/task.repository.factory.js';
import type { CreateTaskDto } from '../dtos/create-task.dto.js';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly taskRepositoryFactory: TaskRepositoryFactory,
    private readonly factory: TaskFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.taskRepositoryFactory.create(ctx);
      const task = this.factory.create(dto);
      const out = await repository.create(task);
      events.push(...task.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
