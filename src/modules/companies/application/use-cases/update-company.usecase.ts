import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { CompanyNotFoundError } from '../../../../shared/errors/company-not-found.error.js';
import { Company } from '../../domain/entities/company.entity.js';
import { DomainUrl } from '../../domain/value-objects/domain-url.vo.js';
import { CompanyDomainUniqueSpec } from '../../domain/specifications/company-domain-unique.specification.js';
import { CompanyRepositoryFactory } from '../../infrastructure/repositories/company.repository.factory.js';
import type { UpdateCompanyDto } from '../dtos/update-company.dto.js';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly companyRepositoryFactory: CompanyRepositoryFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(id: string, dto: UpdateCompanyDto): Promise<Company> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.companyRepositoryFactory.create(ctx);
      const company = await repository.findById(id);
      if (!company) {
        throw new CompanyNotFoundError(id);
      }

      const domain = dto.domain !== undefined ? dto.domain : company.domain;
      if (domain) {
        const domainVO = new DomainUrl(domain);
        const spec = new CompanyDomainUniqueSpec(repository);
        const domainUnique = await spec.isSatisfiedBy(domainVO, id);
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

      const out = await repository.update(company);
      events.push(...company.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
