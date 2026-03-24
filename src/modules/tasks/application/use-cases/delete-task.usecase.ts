import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { TaskNotFoundError } from '../../../../shared/errors/task-not-found.error.js';
import { TaskRepositoryFactory } from '../../infrastructure/repositories/task.repository.factory.js';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly taskRepositoryFactory: TaskRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string): Promise<void> {
    const events: DomainEvent[] = [];

    await this.uow.execute(async (ctx) => {
      const repository = this.taskRepositoryFactory.create(ctx);
      const task = await repository.findById(id);
      if (!task) {
        throw new TaskNotFoundError(id);
      }
      task.markDeleted();
      events.push(...task.getDomainEvents());
      await repository.delete(id);
    });

    await this.eventDispatcher.dispatch(events);
  }
}
