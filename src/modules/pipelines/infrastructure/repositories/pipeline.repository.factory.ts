import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import type { IPipelineRepository } from '../../domain/repositories/pipeline.repository.js';
import { PipelineSqlRepository } from './pipeline.repository.impl.js';

@Injectable()
export class PipelineRepositoryFactory {
  create(ctx: TransactionContext): IPipelineRepository {
    return new PipelineSqlRepository(ctx);
  }
}
