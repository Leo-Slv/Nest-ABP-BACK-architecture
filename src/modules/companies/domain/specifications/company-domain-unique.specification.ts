import type { Specification } from '../../../../shared/domain/specification.js';
import { DomainUrl } from '../value-objects/domain-url.vo.js';
import type { ICompanyRepository } from '../repositories/company.repository.js';

export class CompanyDomainUniqueSpec implements Specification<DomainUrl> {
  constructor(private readonly repository: ICompanyRepository) {}

  async isSatisfiedBy(domain: DomainUrl, excludeCompanyId?: string): Promise<boolean> {
    const existing = await this.repository.findByDomain(domain.value);
    if (!existing) return true;
    if (excludeCompanyId && existing.id === excludeCompanyId) return true;
    return false;
  }
}
