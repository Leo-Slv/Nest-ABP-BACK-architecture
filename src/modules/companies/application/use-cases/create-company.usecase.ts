import { Inject, Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../../../shared/domain/domain-event.js';
import type { IDomainEventDispatcher } from '../../../../shared/domain/domain-event-dispatcher.js';
import type { IUnitOfWork } from '../../../../shared/infrastructure/database/unit-of-work.js';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Company } from '../../domain/entities/company.entity.js';
import { DomainUrl } from '../../domain/value-objects/domain-url.vo.js';
import { CompanyDomainUniqueSpec } from '../../domain/specifications/company-domain-unique.specification.js';
import { CompanyFactory } from '../../domain/factories/company.factory.js';
import { CompanyRepositoryFactory } from '../../infrastructure/repositories/company.repository.factory.js';
import type { CreateCompanyDto } from '../dtos/create-company.dto.js';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly companyRepositoryFactory: CompanyRepositoryFactory,
    private readonly factory: CompanyFactory,
    @Inject('IDomainEventDispatcher')
    private readonly eventDispatcher: IDomainEventDispatcher,
  ) {}

  async execute(dto: CreateCompanyDto): Promise<Company> {
    const events: DomainEvent[] = [];

    const saved = await this.uow.execute(async (ctx) => {
      const repository = this.companyRepositoryFactory.create(ctx);
      const name = new Name(dto.name);

      if (dto.domain) {
        const domain = new DomainUrl(dto.domain);
        const spec = new CompanyDomainUniqueSpec(repository);
        const domainUnique = await spec.isSatisfiedBy(domain);
        if (!domainUnique) {
          throw new ConflictError(`Empresa com domínio ${dto.domain} já existe`);
        }
        const company = this.factory.create({
          name,
          domain,
          industry: dto.industry ?? null,
          website: dto.website ?? null,
        });
        const out = await repository.create(company);
        events.push(...company.getDomainEvents());
        return out;
      }

      const company = this.factory.create({
        name,
        domain: null,
        industry: dto.industry ?? null,
        website: dto.website ?? null,
      });
      const out = await repository.create(company);
      events.push(...company.getDomainEvents());
      return out;
    });

    await this.eventDispatcher.dispatch(events);
    return saved;
  }
}
