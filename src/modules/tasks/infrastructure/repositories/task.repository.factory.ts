import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import type { ITaskRepository } from '../../domain/repositories/task.repository.js';
import { TaskSqlRepository } from './task.repository.impl.js';

@Injectable()
export class TaskRepositoryFactory {
  create(ctx: TransactionContext): ITaskRepository {
    return new TaskSqlRepository(ctx);
  }
}
