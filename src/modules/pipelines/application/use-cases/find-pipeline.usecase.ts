import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import type { IPipelineRepository } from '../../domain/repositories/pipeline.repository.js';

@Injectable()
export class FindPipelineUseCase {
  constructor(
    @Inject('IPipelineRepository')
    private readonly repository: IPipelineRepository,
  ) {}

  async execute(id: string): Promise<Pipeline> {
    const pipeline = await this.repository.findById(id);
    if (!pipeline) {
      throw new NotFoundError(`Pipeline ${id} não encontrado`);
    }
    return pipeline;
  }
}
