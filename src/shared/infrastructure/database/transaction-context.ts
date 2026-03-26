import type { Prisma } from '@prisma/client';

/**
 * Holds the Prisma transaction client for the current Unit of Work.
 * @see docs/unitOfWorkImplementation.md
 */
export interface TransactionContext {
  prisma: Prisma.TransactionClient;
}
