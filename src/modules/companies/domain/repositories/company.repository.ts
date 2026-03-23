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
  create(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Company | null>;
  findByDomain(domain: string): Promise<Company | null>;
  list(params: ListCompaniesParams): Promise<ListCompaniesResult>;
}
