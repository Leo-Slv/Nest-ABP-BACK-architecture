import { Company } from '../entities/company.entity.js';

export interface ListCompaniesParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ListCompaniesResult {
  data: Company[];
  total: number;
  page: number;
  limit: number;
}

export interface ICompanyRepository {
  create(data: {
    name: string;
    domain?: string | null;
    industry?: string | null;
    website?: string | null;
  }): Promise<Company>;
  update(
    id: string,
    data: Partial<{
      name: string;
      domain: string | null;
      industry: string | null;
      website: string | null;
    }>,
  ): Promise<Company>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Company | null>;
  findByDomain(domain: string): Promise<Company | null>;
  list(params: ListCompaniesParams): Promise<ListCompaniesResult>;
}
