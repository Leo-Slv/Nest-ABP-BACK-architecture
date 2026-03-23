import { Name } from '../../../../shared/domain/value-objects/name.vo.js';
import { Company } from '../entities/company.entity.js';
import { DomainUrl } from '../value-objects/domain-url.vo.js';

export type CreateCompanyInput = {
  name: Name;
  domain?: DomainUrl | null;
  industry?: string | null;
  website?: string | null;
};

/**
 * Factory para criação do agregado `Company`.
 * Centraliza a composição inicial e chama `Company.createNew`.
 */
export class CompanyFactory {
  create(input: CreateCompanyInput): Company {
    return Company.createNew({
      name: input.name.value,
      domain: input.domain?.value ?? null,
      industry: input.industry ?? null,
      website: input.website ?? null,
    });
  }
}

