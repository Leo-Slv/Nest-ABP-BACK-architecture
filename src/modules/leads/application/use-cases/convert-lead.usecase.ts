import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import { LeadRepositoryFactory } from '../../infrastructure/repositories/lead.repository.factory.js';

@Injectable()
export class ConvertLeadUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly leadRepositoryFactory: LeadRepositoryFactory,
  ) {}

  async execute(leadId: string): Promise<Lead> {
    return this.uow.execute(async (ctx) => {
      const repository = this.leadRepositoryFactory.create(ctx);
      return repository.convert(leadId);
    });
  }
}
