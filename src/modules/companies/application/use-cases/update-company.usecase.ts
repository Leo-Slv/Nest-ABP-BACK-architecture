import { Injectable, Inject } from '@nestjs/common';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { CompanyNotFoundError } from '../../../../shared/errors/company-not-found.error.js';
import { Company } from '../../domain/entities/company.entity.js';
import { DomainUrl } from '../../domain/value-objects/domain-url.vo.js';
import { CompanyDomainUniqueSpec } from '../../domain/specifications/company-domain-unique.specification.js';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.js';
import type { UpdateCompanyDto } from '../dtos/update-company.dto.js';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject('ICompanyRepository')
    private readonly repository: ICompanyRepository,
    private readonly domainUniqueSpec: CompanyDomainUniqueSpec,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new CompanyNotFoundError(id);
    }

    const domain = dto.domain !== undefined ? dto.domain : company.domain;
    if (domain) {
      const domainVO = new DomainUrl(domain);
      const domainUnique = await this.domainUniqueSpec.isSatisfiedBy(domainVO, id);
      if (!domainUnique) {
        throw new ConflictError(`Empresa com domínio ${domain} já existe`);
      }
    }
    const name =
      dto.name !== undefined ? new Name(dto.name).value : company.name;

    company.applyUpdate({
      name,
      domain:
        dto.domain !== undefined
          ? dto.domain
            ? new DomainUrl(dto.domain).value
            : null
          : company.domain,
      industry: dto.industry !== undefined ? dto.industry : company.industry,
      website: dto.website !== undefined ? dto.website : company.website,
    });

    const saved = await this.repository.update(company);
    await this.eventDispatcher.dispatch(company.getDomainEvents());
    return saved;
  }
}
