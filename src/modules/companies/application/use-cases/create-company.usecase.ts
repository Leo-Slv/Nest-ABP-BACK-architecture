import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Company } from '../../domain/entities/company.entity.js';
import { DomainUrl } from '../../domain/value-objects/domain-url.vo.js';
import { CompanyDomainUniqueSpec } from '../../domain/specifications/company-domain-unique.specification.js';
import { CompanyFactory } from '../../domain/factories/company.factory.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { CreateCompanyDto } from '../dtos/create-company.dto.js';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
    private readonly domainUniqueSpec: CompanyDomainUniqueSpec,
    private readonly factory: CompanyFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateCompanyDto): Promise<Company> {
    const name = new Name(dto.name);
    if (dto.domain) {
      const domain = new DomainUrl(dto.domain);
      const domainUnique = await this.domainUniqueSpec.isSatisfiedBy(domain);
      if (!domainUnique) {
        throw new ConflictError(`Empresa com domínio ${dto.domain} já existe`);
      }
      const company = this.factory.create({
        name,
        domain,
        industry: dto.industry ?? null,
        website: dto.website ?? null,
      });
      const saved = await this.repository.create(company);
      await this.eventDispatcher.dispatch(company.getDomainEvents());
      return saved;
    }

    const company = this.factory.create({
      name,
      domain: null,
      industry: dto.industry ?? null,
      website: dto.website ?? null,
    });
    const saved = await this.repository.create(company);
    await this.eventDispatcher.dispatch(company.getDomainEvents());
    return saved;
  }
}
