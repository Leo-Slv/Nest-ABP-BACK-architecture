import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new NotFoundError(`Tarefa ${id} não encontrada`);
    }
    await this.repository.delete(id);
  }
}
