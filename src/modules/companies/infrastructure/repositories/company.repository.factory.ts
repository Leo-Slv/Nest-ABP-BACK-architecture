import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import { CompanySqlRepository } from './company.repository.impl.js';

@Injectable()
export class CompanyRepositoryFactory {
  create(ctx: TransactionContext): ICompanyRepository {
    return new CompanySqlRepository(ctx);
  }
}
