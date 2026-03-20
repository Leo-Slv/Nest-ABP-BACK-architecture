import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service.js';
import { CompanyMapper } from '../../application/mappers/company.mapper.js';
import type {
  ICompanyRepository,
  ListCompaniesParams,
  ListCompaniesResult,
} from '../../domain/repositories/company.repository.js';
import { Company } from '../../domain/entities/company.entity.js';

@Injectable()
export class CompanyPrismaRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    domain?: string | null;
    industry?: string | null;
    website?: string | null;
  }): Promise<Company> {
    const created = await this.prisma.company.create({
      data: {
        name: data.name,
        domain: data.domain ?? null,
        industry: data.industry ?? null,
        website: data.website ?? null,
      },
    });
    return CompanyMapper.toDomain(created);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      domain: string | null;
      industry: string | null;
      website: string | null;
    }>,
  ): Promise<Company> {
    const updated = await this.prisma.company.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.domain !== undefined && { domain: data.domain }),
        ...(data.industry !== undefined && { industry: data.industry }),
        ...(data.website !== undefined && { website: data.website }),
      },
    });
    return CompanyMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }

  async findById(id: string): Promise<Company | null> {
    const found = await this.prisma.company.findUnique({ where: { id } });
    return found ? CompanyMapper.toDomain(found) : null;
  }

  async findByDomain(domain: string): Promise<Company | null> {
    const found = await this.prisma.company.findUnique({ where: { domain } });
    return found ? CompanyMapper.toDomain(found) : null;
  }

  async list(params: ListCompaniesParams): Promise<ListCompaniesResult> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { domain: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: data.map((c) => CompanyMapper.toDomain(c)),
      total,
      page,
      limit,
    };
  }
}
