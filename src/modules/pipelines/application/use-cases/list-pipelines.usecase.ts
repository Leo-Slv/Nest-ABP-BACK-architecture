import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import type {
  ListPipelinesResult,
} from '../../domain/repositories/pipeline.repository.js';
import { PipelineRepositoryFactory } from '../../infrastructure/repositories/pipeline.repository.factory.js';

@Injectable()
export class ListPipelinesUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly pipelineRepositoryFactory: PipelineRepositoryFactory,
  ) {}

  async execute(params: { page?: number; limit?: number } = {}): Promise<ListPipelinesResult> {
    return this.uow.execute(async (ctx) => {
      const repository = this.pipelineRepositoryFactory.create(ctx);
      return repository.list({
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      });
    });
  }
}
