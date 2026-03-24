import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { TaskNotFoundError } from '../../../../shared/errors/task-not-found.error.js';
import type { Task } from '../../domain/entities/task.entity.js';
import { TaskRepositoryFactory } from '../../infrastructure/repositories/task.repository.factory.js';
import type { UpdateTaskDto } from '../dtos/update-task.dto.js';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly taskRepositoryFactory: TaskRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.taskRepositoryFactory.create(ctx);
      const task = await repository.findById(id);
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

      const out = await repository.update(task);
      events.push(...task.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
