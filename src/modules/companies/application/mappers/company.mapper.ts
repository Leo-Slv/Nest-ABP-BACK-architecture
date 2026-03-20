import { Company } from '../../domain/entities/company.entity.js';
import type { Company as PrismaCompany } from '@prisma/client';

export class CompanyMapper {
  static toDomain(prisma: PrismaCompany): Company {
    return Company.create({
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
    return {
      id: company.id,
      name: company.name,
      domain: company.domain ?? null,
      industry: company.industry ?? null,
      website: company.website ?? null,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }
}
