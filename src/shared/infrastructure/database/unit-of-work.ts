import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool } from 'pg';
import { DATABASE_POOL } from './database.tokens.js';
import type { TransactionContext } from './transaction-context.js';

export interface IUnitOfWork {
  execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}

/**
 * One BEGIN / COMMIT (or ROLLBACK) per {@link execute} call.
 * Uses a dedicated connection from the pool for the whole unit of work.
 */
@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private readonly log = new Logger(UnitOfWork.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      this.log.debug('BEGIN');
      await client.query('BEGIN');
      const result = await work({ client });
      await client.query('COMMIT');
      this.log.debug('COMMIT');
      return result;
    } catch (error) {
      this.log.debug('ROLLBACK');
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
