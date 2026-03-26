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

    await this.ctx.prisma.pipeline.create({
      data: {
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        stages: {
          create: stages.map((s) => ({
            id: randomUUID(),
            name: s.name,
            order: s.order,
          })),
        },
      },
      include: { stages: true },
    });

    const created = await this.findById(pipeline.id);
    if (!created) {
      throw new PipelineNotFoundError(pipeline.id);
    }
    return created;
  }

  async update(pipeline: Pipeline): Promise<Pipeline> {
    const existing = await this.findById(pipeline.id);
    if (!existing) throw new PipelineNotFoundError(pipeline.id);

    await this.ctx.prisma.pipeline.update({
      where: { id: pipeline.id },
      data: {
        name: pipeline.name,
        updatedAt: new Date(),
      },
    });

    const updated = await this.findById(pipeline.id);
    if (!updated) throw new PipelineNotFoundError(pipeline.id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    try {
      await this.ctx.prisma.pipeline.delete({ where: { id } });
    } catch {
      throw new PipelineNotFoundError(id);
    }
  }

  async findById(id: string): Promise<Pipeline | null> {
    const row = await this.ctx.prisma.pipeline.findUnique({
      where: { id },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
    return row ? PipelineMapper.toDomain(row) : null;
  }

  async list(params: {
    page: number;
    limit: number;
  }): Promise<ListPipelinesResult> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      this.ctx.prisma.pipeline.count(),
      this.ctx.prisma.pipeline.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { stages: { orderBy: { order: 'asc' } } },
      }),
    ]);
    const pipelines = rows.map((row) => PipelineMapper.toDomain(row));

    return {
      data: pipelines,
      total,
      page,
      limit,
    };
  }
}
