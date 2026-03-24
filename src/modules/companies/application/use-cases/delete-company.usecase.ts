import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { CompanyNotFoundError } from '../../../../shared/errors/company-not-found.error.js';
import { CompanyRepositoryFactory } from '../../infrastructure/repositories/company.repository.factory.js';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly companyRepositoryFactory: CompanyRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string): Promise<void> {
    const events: DomainEvent[] = [];

    await this.uow.execute(async (ctx) => {
      const repository = this.companyRepositoryFactory.create(ctx);
      const company = await repository.findById(id);
      if (!company) {
        throw new CompanyNotFoundError(id);
      }
      company.markDeleted();
      events.push(...company.getDomainEvents());
      await repository.delete(id);
    });

    await this.eventDispatcher.dispatch(events);
  }
}
