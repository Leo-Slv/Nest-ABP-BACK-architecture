import { Injectable } from '@nestjs/common';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import type { IContactRepository } from '../../domain/repositories/contact.repository.js';
import { ContactSqlRepository } from './contact.repository.impl.js';

@Injectable()
export class ContactRepositoryFactory {
  create(ctx: TransactionContext): IContactRepository {
    return new ContactSqlRepository(ctx);
  }
}
