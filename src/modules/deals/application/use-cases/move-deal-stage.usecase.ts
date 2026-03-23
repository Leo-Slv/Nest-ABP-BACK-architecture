import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { DealNotFoundError } from '../../../../shared/errors/deal-not-found.error.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import type { MoveStageDto } from '../dtos/move-stage.dto.js';

@Injectable()
export class MoveDealStageUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dealId: string, dto: MoveStageDto): Promise<Deal> {
    const deal = await this.repository.findById(dealId);
    if (!deal) {
      throw new DealNotFoundError(dealId);
    }

    const stage = dto.stage as DealStage;
    deal.moveToStage(stage, dto.pipelineStageId ?? null);

    const saved = await this.repository.update(deal);
    await this.eventDispatcher.dispatch(deal.getDomainEvents());
    return saved;
  }
}
