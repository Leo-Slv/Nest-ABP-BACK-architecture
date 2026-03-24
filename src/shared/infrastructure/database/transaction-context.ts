import type { PoolClient } from 'pg';

/**
 * Holds the PostgreSQL client for the current transaction (Unit of Work).
 * @see docs/unitOfWorkImplementation.md
 */
export interface TransactionContext {
  client: PoolClient;
}
