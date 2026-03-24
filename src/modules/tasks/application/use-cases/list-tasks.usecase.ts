import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import type {
  ListTasksResult,
} from '../../domain/repositories/task.repository.js';
import type { ListTasksDto } from '../dtos/list-tasks.dto.js';
import { TaskRepositoryFactory } from '../../infrastructure/repositories/task.repository.factory.js';

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly taskRepositoryFactory: TaskRepositoryFactory,
  ) {}

  async execute(params: ListTasksDto): Promise<ListTasksResult> {
    return this.uow.execute(async (ctx) => {
      const repository = this.taskRepositoryFactory.create(ctx);
      return repository.list({
        page: params.page ?? 1,
        limit: params.limit ?? 20,
        type: params.type,
        dealId: params.dealId,
        contactId: params.contactId,
      });
    });
  }
}
