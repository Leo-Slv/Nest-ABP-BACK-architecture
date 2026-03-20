import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Task } from '../../domain/entities/task.entity.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';

@Injectable()
export class FindTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
  ) {}

  async execute(id: string): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new NotFoundError(`Tarefa ${id} não encontrada`);
    }
    return task;
  }
}
