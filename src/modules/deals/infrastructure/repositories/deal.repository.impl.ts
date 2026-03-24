import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { DealMapper } from '../../application/mappers/deal.mapper.js';
import type {
  IDealRepository,
  ListDealsParams,
  ListDealsResult,
} from '../../domain/repositories/deal.repository.js';
import { Deal } from '../../domain/entities/deal.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';

export class DealSqlRepository implements IDealRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(deal: Deal): Promise<Deal> {
    const d = DealMapper.toPersistence(deal);
    const p = deal.toPersistence();
    const r = await this.ctx.client.query(
      `INSERT INTO "Deal" (
        "id", "title", "value", "stage", "pipelineId", "pipelineStageId",
        "contactId", "companyId", "expectedAt", "closedAt", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4::"DealStage", $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *`,
      [
        d.id,
        d.title,
        d.value,
        d.stage,
        d.pipelineId,
        d.pipelineStageId,
        d.contactId,
        d.companyId,
        d.expectedAt,
        d.closedAt,
        p.createdAt,
        p.updatedAt,
      ],
    );
    return DealMapper.toDomain(r.rows[0]);
  }

  async update(deal: Deal): Promise<Deal> {
    const d = DealMapper.toPersistence(deal);
    const p = deal.toPersistence();
    const r = await this.ctx.client.query(
      `UPDATE "Deal" SET
        "title" = $2, "value" = $3, "stage" = $4::"DealStage",
        "pipelineId" = $5, "pipelineStageId" = $6,
        "contactId" = $7, "companyId" = $8,
        "expectedAt" = $9, "closedAt" = $10, "updatedAt" = $11
      WHERE "id" = $1
      RETURNING *`,
      [
        deal.id,
        d.title,
        d.value,
        d.stage,
        d.pipelineId,
        d.pipelineStageId,
        d.contactId,
        d.companyId,
        d.expectedAt,
        d.closedAt,
        p.updatedAt,
      ],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Deal ${deal.id} não encontrado`);
    }
    return DealMapper.toDomain(r.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const r = await this.ctx.client.query(
      `DELETE FROM "Deal" WHERE "id" = $1`,
      [id],
    );
    if (r.rowCount === 0) {
      throw new NotFoundError(`Deal ${id} não encontrado`);
    }
  }

  async findById(id: string): Promise<Deal | null> {
    const r = await this.ctx.client.query(
      `SELECT * FROM "Deal" WHERE "id" = $1`,
      [id],
    );
    return r.rows[0] ? DealMapper.toDomain(r.rows[0]) : null;
  }

  async list(params: ListDealsParams): Promise<ListDealsResult> {
    const { page, limit, stage, pipelineId } = params;
    const skip = (page - 1) * limit;
    const conds: string[] = [];
    const vals: unknown[] = [];
    let n = 1;

    if (stage) {
      conds.push(`"stage" = $${n}::"DealStage"`);
      vals.push(stage);
      n += 1;
    }
    if (pipelineId) {
      conds.push(`"pipelineId" = $${n}`);
      vals.push(pipelineId);
      n += 1;
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const whereParams = [...vals];

    const countR = await this.ctx.client.query(
      `SELECT COUNT(*)::int AS c FROM "Deal" ${where}`,
      whereParams,
    );
    const total = countR.rows[0].c as number;

    vals.push(limit, skip);
    const dataR = await this.ctx.client.query(
      `SELECT * FROM "Deal" ${where}
       ORDER BY "createdAt" DESC
       LIMIT $${n} OFFSET $${n + 1}`,
      vals,
    );

    return {
      data: dataR.rows.map((row) => DealMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}
