import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { CompanyNotFoundError } from '../../../../shared/errors/company-not-found.error.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string): Promise<void> {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new CompanyNotFoundError(id);
    }
    company.markDeleted();
    await this.eventDispatcher.dispatch(company.getDomainEvents());
    await this.repository.delete(id);
  }
}
