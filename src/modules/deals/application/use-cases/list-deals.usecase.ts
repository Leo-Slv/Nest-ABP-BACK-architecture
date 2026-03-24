import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import type {
  ListDealsResult,
} from '../../domain/repositories/deal.repository.js';
import type { ListDealsDto } from '../dtos/list-deals.dto.js';
import { DealRepositoryFactory } from '../../infrastructure/repositories/deal.repository.factory.js';

@Injectable()
export class ListDealsUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly dealRepositoryFactory: DealRepositoryFactory,
  ) {}

  async execute(query: ListDealsDto): Promise<ListDealsResult> {
    return this.uow.execute(async (ctx) => {
      const repository = this.dealRepositoryFactory.create(ctx);
      return repository.list({
        page: query.page,
        limit: query.limit,
        stage: query.stage,
        pipelineId: query.pipelineId,
      });
    });
  }
}
