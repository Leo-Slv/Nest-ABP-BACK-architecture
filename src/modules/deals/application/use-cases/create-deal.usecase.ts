import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { Deal } from '../../domain/entities/deal.entity.js';
import { DealFactory } from '../../domain/factories/deal.factory.js';
import { DealRepositoryFactory } from '../../infrastructure/repositories/deal.repository.factory.js';
import type { CreateDealDto } from '../dtos/create-deal.dto.js';

@Injectable()
export class CreateDealUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly dealRepositoryFactory: DealRepositoryFactory,
    private readonly factory: DealFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateDealDto): Promise<Deal> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.dealRepositoryFactory.create(ctx);
      const deal = this.factory.create(dto);
      const out = await repository.create(deal);
      events.push(...deal.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
