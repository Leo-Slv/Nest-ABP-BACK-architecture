import { Company } from '../../domain/entities/company.entity.js';

export type CompanyRow = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class CompanyMapper {
  static toDomain(prisma: CompanyRow): Company {
    return Company.reconstitute({
      id: prisma.id,
      name: prisma.name,
      domain: prisma.domain ?? null,
      industry: prisma.industry ?? null,
      website: prisma.website ?? null,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPersistence(company: Company) {
    const p = company.toPersistence();
    return {
      id: p.id,
      name: p.name,
      domain: p.domain ?? null,
      industry: p.industry ?? null,
      website: p.website ?? null,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
