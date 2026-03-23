import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { DealNotFoundError } from '../../../../shared/errors/deal-not-found.error.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import { DealValue } from '../../domain/value-objects/deal-value.vo.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import type { UpdateDealDto } from '../dtos/update-deal.dto.js';

@Injectable()
export class UpdateDealUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateDealDto): Promise<Deal> {
    const deal = await this.repository.findById(id);
    if (!deal) {
      throw new DealNotFoundError(id);
    }

    const value =
      dto.value !== undefined ? new DealValue(dto.value).value : deal.value;

    deal.applyUpdate({
      title: dto.title ?? deal.title,
      value,
      stage: dto.stage ?? deal.stage,
      pipelineId:
        dto.pipelineId !== undefined ? dto.pipelineId : deal.pipelineId,
      pipelineStageId:
        dto.pipelineStageId !== undefined
          ? dto.pipelineStageId
          : deal.pipelineStageId,
      contactId:
        dto.contactId !== undefined ? dto.contactId : deal.contactId,
      companyId:
        dto.companyId !== undefined ? dto.companyId : deal.companyId,
      expectedAt:
        dto.expectedAt !== undefined
          ? dto.expectedAt
            ? new Date(dto.expectedAt)
            : null
          : deal.expectedAt,
      closedAt:
        dto.closedAt !== undefined
          ? dto.closedAt
            ? new Date(dto.closedAt)
            : null
          : deal.closedAt,
    });

    const saved = await this.repository.update(deal);
    await this.eventDispatcher.dispatch(deal.getDomainEvents());
    return saved;
  }
}
