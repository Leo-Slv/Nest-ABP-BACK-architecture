import { Injectable, Inject } from '@nestjs/common';
import type { ICompanyRepository, ListCompaniesResult } from '../../domain/repositories/company.repository.js';
import type { ListCompaniesDto } from '../dtos/list-companies.dto.js';

@Injectable()
export class ListCompaniesUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(dto: ListCompaniesDto): Promise<ListCompaniesResult> {
    return this.repository.list({
      page: dto.page,
      limit: dto.limit,
      search: dto.search,
    });
  }
}
