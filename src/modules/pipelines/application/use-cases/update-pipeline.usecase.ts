import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { PipelineNotFoundError } from '../../../../shared/errors/pipeline-not-found.error.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import type { IPipelineRepository } from '../../domain/repositories/pipeline.repository.js';
import type { UpdatePipelineDto } from '../dtos/update-pipeline.dto.js';

@Injectable()
export class UpdatePipelineUseCase {
  constructor(
    @Inject('IPipelineRepository')
    private readonly repository: IPipelineRepository,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdatePipelineDto): Promise<Pipeline> {
    const pipeline = await this.repository.findById(id);
    if (!pipeline) {
      throw new PipelineNotFoundError(id);
    }

    if (dto.name === undefined) {
      return pipeline;
    }

    pipeline.changeName(new Name(dto.name).value);
    const saved = await this.repository.update(pipeline);
    await this.eventDispatcher.dispatch(pipeline.getDomainEvents());
    return saved;
  }
}
