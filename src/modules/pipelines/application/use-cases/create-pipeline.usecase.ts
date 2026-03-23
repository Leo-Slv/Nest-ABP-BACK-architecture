import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import { PipelineFactory } from '../../domain/factories/pipeline.factory.js';
import type { IPipelineRepository } from '../../domain/repositories/pipeline.repository.js';
import type { CreatePipelineDto } from '../dtos/create-pipeline.dto.js';

@Injectable()
export class CreatePipelineUseCase {
  constructor(
    @Inject('IPipelineRepository')
    private readonly repository: IPipelineRepository,
    private readonly factory: PipelineFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreatePipelineDto): Promise<Pipeline> {
    const pipeline = this.factory.create(dto);

    const saved = await this.repository.create(pipeline);
    await this.eventDispatcher.dispatch(pipeline.getDomainEvents());
    return saved;
  }
}
