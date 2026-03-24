import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { PipelineNotFoundError } from '../../../../shared/errors/pipeline-not-found.error.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import { PipelineRepositoryFactory } from '../../infrastructure/repositories/pipeline.repository.factory.js';
import type { UpdatePipelineDto } from '../dtos/update-pipeline.dto.js';

@Injectable()
export class UpdatePipelineUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly pipelineRepositoryFactory: PipelineRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdatePipelineDto): Promise<Pipeline> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.pipelineRepositoryFactory.create(ctx);
      const pipeline = await repository.findById(id);
      if (!pipeline) {
        throw new PipelineNotFoundError(id);
      }

      if (dto.name === undefined) {
        return pipeline;
      }

      pipeline.changeName(new Name(dto.name).value);
      const out = await repository.update(pipeline);
      events.push(...pipeline.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
