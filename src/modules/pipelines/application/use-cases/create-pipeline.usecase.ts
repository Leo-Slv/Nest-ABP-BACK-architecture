import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import { PipelineFactory } from '../../domain/factories/pipeline.factory.js';
import { PipelineRepositoryFactory } from '../../infrastructure/repositories/pipeline.repository.factory.js';
import type { CreatePipelineDto } from '../dtos/create-pipeline.dto.js';

@Injectable()
export class CreatePipelineUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly pipelineRepositoryFactory: PipelineRepositoryFactory,
    private readonly factory: PipelineFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreatePipelineDto): Promise<Pipeline> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.pipelineRepositoryFactory.create(ctx);
      const pipeline = this.factory.create(dto);
      const out = await repository.create(pipeline);
      events.push(...pipeline.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
