import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { PipelineRepositoryFactory } from '../../infrastructure/repositories/pipeline.repository.factory.js';

@Injectable()
export class DeletePipelineUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly pipelineRepositoryFactory: PipelineRepositoryFactory,
  ) {}

  async execute(id: string): Promise<void> {
    await this.uow.execute(async (ctx) => {
      const repository = this.pipelineRepositoryFactory.create(ctx);
      const pipeline = await repository.findById(id);
      if (!pipeline) {
        throw new NotFoundError(`Pipeline ${id} não encontrado`);
      }
      await repository.delete(id);
    });
  }
}
