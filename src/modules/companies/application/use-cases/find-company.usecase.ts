import { Injectable, Inject } from '@nestjs/common';
import { CompanyNotFoundError } from '../../../../shared/errors/company-not-found.error.js';
import { Company } from '../../domain/entities/company.entity.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';

@Injectable()
export class FindCompanyUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(id: string): Promise<Company> {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new CompanyNotFoundError(id);
    }
    return company;
  }
}
