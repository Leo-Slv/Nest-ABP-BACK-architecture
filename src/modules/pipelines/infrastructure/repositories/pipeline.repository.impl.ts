import { randomUUID } from 'node:crypto';
import { PipelineNotFoundError } from '../../../../shared/errors/pipeline-not-found.error.js';
import { PipelineMapper } from '../../application/mappers/pipeline.mapper.js';
import type {
  IPipelineRepository,
  ListPipelinesResult,
} from '../../domain/repositories/pipeline.repository.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';

export class PipelineSqlRepository implements IPipelineRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(pipeline: Pipeline): Promise<Pipeline> {
    const p = pipeline.toPersistence();
    const stages = pipeline.getPendingStagesForCreate();

    await this.ctx.client.query(
      `INSERT INTO "Pipeline" ("id", "name", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4)`,
      [p.id, p.name, p.createdAt, p.updatedAt],
    );

    for (const s of stages) {
      const sid = randomUUID();
      await this.ctx.client.query(
        `INSERT INTO "PipelineStage" ("id", "name", "order", "pipelineId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [sid, s.name, s.order, p.id],
      );
    }

    const created = await this.findById(pipeline.id);
    if (!created) {
      throw new PipelineNotFoundError(pipeline.id);
    }
    return created;
  }

  async update(pipeline: Pipeline): Promise<Pipeline> {
    const existing = await this.findById(pipeline.id);
    if (!existing) throw new PipelineNotFoundError(pipeline.id);

    await this.ctx.client.query(
      `UPDATE "Pipeline" SET "name" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
      [pipeline.name, pipeline.id],
    );

    const updated = await this.findById(pipeline.id);
    if (!updated) throw new PipelineNotFoundError(pipeline.id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.ctx.client.query(
      `DELETE FROM "PipelineStage" WHERE "pipelineId" = $1`,
      [id],
    );
    const r = await this.ctx.client.query(
      `DELETE FROM "Pipeline" WHERE "id" = $1`,
      [id],
    );
    if (r.rowCount === 0) {
      throw new PipelineNotFoundError(id);
    }
  }

  async findById(id: string): Promise<Pipeline | null> {
    const pr = await this.ctx.client.query(
      `SELECT * FROM "Pipeline" WHERE "id" = $1`,
      [id],
    );
    const row = pr.rows[0];
    if (!row) return null;

    const sr = await this.ctx.client.query(
      `SELECT * FROM "PipelineStage" WHERE "pipelineId" = $1 ORDER BY "order" ASC`,
      [id],
    );

    return PipelineMapper.toDomain({
      ...row,
      stages: sr.rows,
    });
  }

  async list(params: {
    page: number;
    limit: number;
  }): Promise<ListPipelinesResult> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const countR = await this.ctx.client.query(
      `SELECT COUNT(*)::int AS c FROM "Pipeline"`,
    );
    const total = countR.rows[0].c as number;

    const dataR = await this.ctx.client.query(
      `SELECT * FROM "Pipeline" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [limit, skip],
    );

    const pipelines: Pipeline[] = [];
    for (const row of dataR.rows) {
      const sr = await this.ctx.client.query(
        `SELECT * FROM "PipelineStage" WHERE "pipelineId" = $1 ORDER BY "order" ASC`,
        [row.id],
      );
      pipelines.push(
        PipelineMapper.toDomain({ ...row, stages: sr.rows }),
      );
    }

    return {
      data: pipelines,
      total,
      page,
      limit,
    };
  }
}
