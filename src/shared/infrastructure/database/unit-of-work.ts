import { Injectable, Logger } from '@nestjs/common';
import type { TransactionContext } from './transaction-context.js';
import { PrismaService } from './prisma.service.js';

export interface IUnitOfWork {
  execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}

/**
 * One Prisma transaction per {@link execute} call.
 */
@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private readonly log = new Logger(UnitOfWork.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    this.log.debug('TRANSACTION');
    return this.prisma.$transaction(async (tx) => work({ prisma: tx }));
  }
}
