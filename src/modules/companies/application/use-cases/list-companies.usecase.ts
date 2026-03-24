import { Inject, Injectable } from '@nestjs/common';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import type {
  ListCompaniesResult,
} from '../../domain/repositories/company.repository.js';
import type { ListCompaniesDto } from '../dtos/list-companies.dto.js';
import { CompanyRepositoryFactory } from '../../infrastructure/repositories/company.repository.factory.js';

@Injectable()
export class ListCompaniesUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly companyRepositoryFactory: CompanyRepositoryFactory,
  ) {}

  async execute(dto: ListCompaniesDto): Promise<ListCompaniesResult> {
    return this.uow.execute(async (ctx) => {
      const repository = this.companyRepositoryFactory.create(ctx);
      return repository.list({
        page: dto.page,
        limit: dto.limit,
        search: dto.search,
      });
    });
  }
}
