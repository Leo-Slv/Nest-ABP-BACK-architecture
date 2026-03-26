import { Company } from '../../domain/entities/company.entity.js';
import type { Company as PrismaCompany } from '@prisma/client';

export class CompanyMapper {
  static toDomain(row: PrismaCompany): Company {
    return Company.reconstitute({
      id: row.id,
      name: row.name,
      domain: row.domain ?? null,
      industry: row.industry ?? null,
      website: row.website ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(company: Company): PrismaCompany {
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
