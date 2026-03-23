import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { TaskNotFoundError } from '../../../../shared/errors/task-not-found.error.js';
import type { Task } from '../../domain/entities/task.entity.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';
import type { UpdateTaskDto } from '../dtos/update-task.dto.js';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    task.applyUpdate({
      title: dto.title ?? task.title,
      description:
        dto.description !== undefined ? dto.description : task.description,
      type: dto.type ?? task.type,
      dueAt:
        dto.dueAt !== undefined
          ? dto.dueAt
            ? new Date(dto.dueAt)
            : null
          : task.dueAt,
      leadId: dto.leadId !== undefined ? dto.leadId : task.leadId,
      contactId: dto.contactId !== undefined ? dto.contactId : task.contactId,
      companyId: dto.companyId !== undefined ? dto.companyId : task.companyId,
      dealId: dto.dealId !== undefined ? dto.dealId : task.dealId,
    });

    const saved = await this.repository.update(task);
    await this.eventDispatcher.dispatch(task.getDomainEvents());
    return saved;
  }
}
