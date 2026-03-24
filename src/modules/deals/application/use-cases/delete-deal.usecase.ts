import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { DealRepositoryFactory } from '../../infrastructure/repositories/deal.repository.factory.js';

@Injectable()
export class DeleteDealUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly dealRepositoryFactory: DealRepositoryFactory,
  ) {}

  async execute(id: string): Promise<void> {
    await this.uow.execute(async (ctx) => {
      const repository = this.dealRepositoryFactory.create(ctx);
      const deal = await repository.findById(id);
      if (!deal) {
        throw new NotFoundError(`Deal ${id} não encontrado`);
      }
      await repository.delete(id);
    });
  }
}
