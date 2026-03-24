import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import type {
  ListLeadsResult,
} from '../../domain/repositories/lead.repository.js';
import type { ListLeadsDto } from '../dtos/list-leads.dto.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';
import { LeadRepositoryFactory } from '../../infrastructure/repositories/lead.repository.factory.js';

@Injectable()
export class ListLeadsUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly leadRepositoryFactory: LeadRepositoryFactory,
  ) {}

  async execute(params: ListLeadsDto): Promise<ListLeadsResult> {
    return this.uow.execute(async (ctx) => {
      const repository = this.leadRepositoryFactory.create(ctx);
      return repository.list({
        page: params.page,
        limit: params.limit,
        search: params.search,
        status: params.status as LeadStatus | undefined,
      });
    });
  }
}
