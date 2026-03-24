import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { CompanyNotFoundError } from '../../../../shared/errors/company-not-found.error.js';
import { Company } from '../../domain/entities/company.entity.js';
import { CompanyRepositoryFactory } from '../../infrastructure/repositories/company.repository.factory.js';

@Injectable()
export class FindCompanyUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly companyRepositoryFactory: CompanyRepositoryFactory,
  ) {}

  async execute(id: string): Promise<Company> {
    return this.uow.execute(async (ctx) => {
      const repository = this.companyRepositoryFactory.create(ctx);
      const company = await repository.findById(id);
      if (!company) {
        throw new CompanyNotFoundError(id);
      }
      return company;
    });
  }
}
