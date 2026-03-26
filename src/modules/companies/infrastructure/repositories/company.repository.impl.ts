import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { CompanyMapper } from '../../application/mappers/company.mapper.js';
import type {
  ICompanyRepository,
  ListCompaniesParams,
  ListCompaniesResult,
} from '../../domain/repositories/company.repository.js';
import { Company } from '../../domain/entities/company.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import { Prisma } from '@prisma/client';

export class CompanySqlRepository implements ICompanyRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(company: Company): Promise<Company> {
    const d = CompanyMapper.toPersistence(company);
    const created = await this.ctx.prisma.company.create({
      data: {
        id: d.id,
        name: d.name,
        domain: d.domain,
        industry: d.industry,
        website: d.website,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      },
    });
    return CompanyMapper.toDomain(created);
  }

  async update(company: Company): Promise<Company> {
    const d = CompanyMapper.toPersistence(company);
    try {
      const updated = await this.ctx.prisma.company.update({
        where: { id: company.id },
        data: {
          name: d.name,
          domain: d.domain,
          industry: d.industry,
          website: d.website,
          updatedAt: d.updatedAt,
        },
      });
      return CompanyMapper.toDomain(updated);
    } catch {
      throw new NotFoundError(`Empresa ${company.id} não encontrada`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.ctx.prisma.company.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`Empresa ${id} não encontrada`);
    }
  }

  async findById(id: string): Promise<Company | null> {
    const row = await this.ctx.prisma.company.findUnique({ where: { id } });
    return row ? CompanyMapper.toDomain(row) : null;
  }

  async findByDomain(domain: string): Promise<Company | null> {
    const row = await this.ctx.prisma.company.findUnique({ where: { domain } });
    return row ? CompanyMapper.toDomain(row) : null;
  }

  async list(params: ListCompaniesParams): Promise<ListCompaniesResult> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.CompanyWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { domain: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, rows] = await Promise.all([
      this.ctx.prisma.company.count({ where }),
      this.ctx.prisma.company.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => CompanyMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}
