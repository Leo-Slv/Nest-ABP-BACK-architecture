import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import { DealSqlRepository } from './deal.repository.impl.js';

@Injectable()
export class DealRepositoryFactory {
  create(ctx: TransactionContext): IDealRepository {
    return new DealSqlRepository(ctx);
  }
}
