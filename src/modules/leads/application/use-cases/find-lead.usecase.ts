import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadRepositoryFactory } from '../../infrastructure/repositories/lead.repository.factory.js';

@Injectable()
export class FindLeadUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly leadRepositoryFactory: LeadRepositoryFactory,
  ) {}

  async execute(id: string): Promise<Lead> {
    return this.uow.execute(async (ctx) => {
      const repository = this.leadRepositoryFactory.create(ctx);
      const lead = await repository.findById(id);
      if (!lead) {
        throw new NotFoundError(`Lead ${id} não encontrado`);
      }
      return lead;
    });
  }
}
