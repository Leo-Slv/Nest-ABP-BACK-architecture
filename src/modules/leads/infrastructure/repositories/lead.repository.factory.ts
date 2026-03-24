import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';
import { LeadSqlRepository } from './lead.repository.impl.js';

@Injectable()
export class LeadRepositoryFactory {
  create(ctx: TransactionContext): ILeadRepository {
    return new LeadSqlRepository(ctx);
  }
}
