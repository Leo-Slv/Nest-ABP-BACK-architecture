import { Injectable, Inject } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Company } from '../../domain/entities/company.entity.js';
import { DomainUrl } from '../../domain/value-objects/domain-url.vo.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { CreateCompanyDto } from '../dtos/create-company.dto.js';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(dto: CreateCompanyDto): Promise<Company> {
    if (dto.domain) {
      const existing = await this.repository.findByDomain(dto.domain);
      if (existing) {
        throw new ConflictError(`Empresa com domínio ${dto.domain} já existe`);
      }
      new DomainUrl(dto.domain);
    }

    return this.repository.create({
      name: dto.name,
      domain: dto.domain ?? null,
      industry: dto.industry ?? null,
      website: dto.website ?? null,
    });
  }
}
