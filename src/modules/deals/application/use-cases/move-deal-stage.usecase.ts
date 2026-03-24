import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { DealNotFoundError } from '../../../../shared/errors/deal-not-found.error.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';
import { DealRepositoryFactory } from '../../infrastructure/repositories/deal.repository.factory.js';
import type { MoveStageDto } from '../dtos/move-stage.dto.js';

@Injectable()
export class MoveDealStageUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly dealRepositoryFactory: DealRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dealId: string, dto: MoveStageDto): Promise<Deal> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.dealRepositoryFactory.create(ctx);
      const deal = await repository.findById(dealId);
      if (!deal) {
        throw new DealNotFoundError(dealId);
      }

      const stage = dto.stage as DealStage;
      deal.moveToStage(stage, dto.pipelineStageId ?? null);

      const out = await repository.update(deal);
      events.push(...deal.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
