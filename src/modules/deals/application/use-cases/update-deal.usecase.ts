import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { DealNotFoundError } from '../../../../shared/errors/deal-not-found.error.js';
import type { Deal } from '../../domain/entities/deal.entity.js';
import { DealValue } from '../../domain/value-objects/deal-value.vo.js';
import { DealRepositoryFactory } from '../../infrastructure/repositories/deal.repository.factory.js';
import type { UpdateDealDto } from '../dtos/update-deal.dto.js';

@Injectable()
export class UpdateDealUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly dealRepositoryFactory: DealRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateDealDto): Promise<Deal> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.dealRepositoryFactory.create(ctx);
      const deal = await repository.findById(id);
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

      const out = await repository.update(deal);
      events.push(...deal.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
