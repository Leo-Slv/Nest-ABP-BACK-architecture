import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import type { IPipelineRepository } from '../../domain/repositories/pipeline.repository.js';

@Injectable()
export class DeletePipelineUseCase {
  constructor(
    @Inject('IPipelineRepository')
    private readonly repository: IPipelineRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const pipeline = await this.repository.findById(id);
    if (!pipeline) {
      throw new NotFoundError(`Pipeline ${id} não encontrado`);
    }
    await this.repository.delete(id);
  }
}
