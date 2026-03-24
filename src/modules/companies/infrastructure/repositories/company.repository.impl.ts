import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { CompanyMapper } from '../../application/mappers/company.mapper.js';
import type {
  ICompanyRepository,
  ListCompaniesParams,
  ListCompaniesResult,
} from '../../domain/repositories/company.repository.js';
import { Company } from '../../domain/entities/company.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';

export class CompanySqlRepository implements ICompanyRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(company: Company): Promise<Company> {
    const d = CompanyMapper.toPersistence(company);
    const r = await this.ctx.client.query(
      `INSERT INTO "Company" (
        "id", "name", "domain", "industry", "website", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        d.id,
        d.name,
        d.domain,
        d.industry,
        d.website,
        d.createdAt,
        d.updatedAt,
      ],
    );
    return CompanyMapper.toDomain(r.rows[0]);
  }

  async update(company: Company): Promise<Company> {
    const d = CompanyMapper.toPersistence(company);
    const r = await this.ctx.client.query(
      `UPDATE "Company" SET
        "name" = $2, "domain" = $3, "industry" = $4, "website" = $5, "updatedAt" = $6
      WHERE "id" = $1
      RETURNING *`,
      [
        company.id,
        d.name,
        d.domain,
        d.industry,
        d.website,
        d.updatedAt,
      ],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Empresa ${company.id} não encontrada`);
    }
    return CompanyMapper.toDomain(r.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const r = await this.ctx.client.query(
      `DELETE FROM "Company" WHERE "id" = $1`,
      [id],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Empresa ${id} não encontrada`);
    }
  }

  async findById(id: string): Promise<Company | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Company" WHERE "id" = $1`,
      [id],
    );
    return r.rows[0] ? CompanyMapper.toDomain(r.rows[0]) : null;
  }

  async findByDomain(domain: string): Promise<Company | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Company" WHERE "domain" = $1`,
      [domain],
    );
    return r.rows[0] ? CompanyMapper.toDomain(r.rows[0]) : null;
  }

  async list(params: ListCompaniesParams): Promise<ListCompaniesResult> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;
    const conds: string[] = [];
    const vals: unknown[] = [];
    let n = 1;

    if (search) {
      const p = `%${search}%`;
      conds.push(`("name" ILIKE $${n} OR "domain" ILIKE $${n + 1})`);
      vals.push(p, p);
      n += 2;
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const whereParams = [...vals];

    const countR = await this.ctx.client.query(
      `SELECT COUNT(*)::int AS c FROM "Company" ${where}`,
      whereParams,
    );
    const total = countR.rows[0].c as number;

    vals.push(limit, skip);
    const dataR = await this.ctx.client.query(
      `SELECT * FROM "Company" ${where}
       ORDER BY "createdAt" DESC
       LIMIT $${n} OFFSET $${n + 1}`,
      vals,
    );

    return {
      data: dataR.rows.map((row) => CompanyMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}
