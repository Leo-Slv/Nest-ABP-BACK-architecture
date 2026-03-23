import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { Deal } from '../../domain/entities/deal.entity.js';
import { DealFactory } from '../../domain/factories/deal.factory.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import type { CreateDealDto } from '../dtos/create-deal.dto.js';

@Injectable()
export class CreateDealUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
    private readonly factory: DealFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateDealDto): Promise<Deal> {
    const deal = this.factory.create(dto);

    const saved = await this.repository.create(deal);
    await this.eventDispatcher.dispatch(deal.getDomainEvents());
    return saved;
  }
}
