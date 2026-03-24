import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { TaskNotFoundError } from '../../../../shared/errors/task-not-found.error.js';
import { Task } from '../../domain/entities/task.entity.js';
import { TaskRepositoryFactory } from '../../infrastructure/repositories/task.repository.factory.js';

@Injectable()
export class FindTaskUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly taskRepositoryFactory: TaskRepositoryFactory,
  ) {}

  async execute(id: string): Promise<Task> {
    return this.uow.execute(async (ctx) => {
      const repository = this.taskRepositoryFactory.create(ctx);
      const task = await repository.findById(id);
      if (!task) {
        throw new TaskNotFoundError(id);
      }
      return task;
    });
  }
}
