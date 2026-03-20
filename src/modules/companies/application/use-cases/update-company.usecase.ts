import { Injectable, Inject } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Company } from '../../domain/entities/company.entity.js';
import { DomainUrl } from '../../domain/value-objects/domain-url.vo.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { UpdateCompanyDto } from '../dtos/update-company.dto.js';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
  ) {}

  async execute(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new NotFoundError(`Empresa ${id} não encontrada`);
    }

    const domain = dto.domain !== undefined ? dto.domain : company.domain;
    if (domain) {
      const existing = await this.repository.findByDomain(domain);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Empresa com domínio ${domain} já existe`);
      }
      new DomainUrl(domain);
    }

    return this.repository.update(id, {
      name: dto.name ?? company.name,
      domain: dto.domain !== undefined ? dto.domain : company.domain,
      industry: dto.industry !== undefined ? dto.industry : company.industry,
      website: dto.website !== undefined ? dto.website : company.website,
    });
  }
}
