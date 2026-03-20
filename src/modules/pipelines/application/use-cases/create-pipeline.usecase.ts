import { Injectable, Inject } from '@nestjs/common';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import type { IPipelineRepository } from '../../domain/repositories/pipeline.repository.js';
import type { CreatePipelineDto } from '../dtos/create-pipeline.dto.js';

@Injectable()
export class CreatePipelineUseCase {
  constructor(
    @Inject('IPipelineRepository')
    private readonly repository: IPipelineRepository,
  ) {}

  async execute(dto: CreatePipelineDto): Promise<Pipeline> {
    return this.repository.create({
      name: dto.name,
      stages: dto.stages?.map((s, i) => ({ name: s.name, order: s.order ?? i })) ?? [],
    });
  }
}
