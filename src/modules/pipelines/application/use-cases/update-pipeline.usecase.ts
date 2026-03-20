import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import type { IPipelineRepository } from '../../domain/repositories/pipeline.repository.js';
import type { UpdatePipelineDto } from '../dtos/update-pipeline.dto.js';

@Injectable()
export class UpdatePipelineUseCase {
  constructor(
    @Inject('IPipelineRepository')
    private readonly repository: IPipelineRepository,
  ) {}

  async execute(id: string, dto: UpdatePipelineDto): Promise<Pipeline> {
    const pipeline = await this.repository.findById(id);
    if (!pipeline) {
      throw new NotFoundError(`Pipeline ${id} não encontrado`);
    }
    return this.repository.update(id, {
      name: dto.name ?? pipeline.name,
    });
  }
}
