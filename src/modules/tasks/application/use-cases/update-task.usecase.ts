import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Task } from '../../domain/entities/task.entity.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';
import type { UpdateTaskDto } from '../dtos/update-task.dto.js';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new NotFoundError(`Tarefa ${id} não encontrada`);
    }

    return this.repository.update(id, {
      title: dto.title ?? task.title,
      description: dto.description !== undefined ? dto.description : task.description,
      type: dto.type ?? task.type,
      dueAt: dto.dueAt !== undefined ? (dto.dueAt ? new Date(dto.dueAt) : null) : task.dueAt,
      leadId: dto.leadId !== undefined ? dto.leadId : task.leadId,
      contactId: dto.contactId !== undefined ? dto.contactId : task.contactId,
      companyId: dto.companyId !== undefined ? dto.companyId : task.companyId,
      dealId: dto.dealId !== undefined ? dto.dealId : task.dealId,
    });
  }
}
