import { Injectable, Inject } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity.js';
import { TaskType } from '../../domain/enums/task-type.enum.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';
import type { CreateTaskDto } from '../dtos/create-task.dto.js';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
  ) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    return this.repository.create({
      title: dto.title,
      description: dto.description ?? null,
      type: dto.type ?? TaskType.CALL,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      leadId: dto.leadId ?? null,
      contactId: dto.contactId ?? null,
      companyId: dto.companyId ?? null,
      dealId: dto.dealId ?? null,
    });
  }
}
