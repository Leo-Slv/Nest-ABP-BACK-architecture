import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { LeadRepositoryFactory } from '../../infrastructure/repositories/lead.repository.factory.js';

@Injectable()
export class DeleteLeadUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly leadRepositoryFactory: LeadRepositoryFactory,
  ) {}

  async execute(id: string): Promise<void> {
    await this.uow.execute(async (ctx) => {
      const repository = this.leadRepositoryFactory.create(ctx);
      const lead = await repository.findById(id);
      if (!lead) {
        throw new NotFoundError(`Lead ${id} não encontrado`);
      }
      await repository.delete(id);
    });
  }
}
