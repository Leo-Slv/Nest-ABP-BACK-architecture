import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { DealMapper } from '../../application/mappers/deal.mapper.js';
import type {
  IDealRepository,
  ListDealsParams,
  ListDealsResult,
} from '../../domain/repositories/deal.repository.js';
import { Deal } from '../../domain/entities/deal.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import { Prisma } from '@prisma/client';

export class DealSqlRepository implements IDealRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(deal: Deal): Promise<Deal> {
    const d = DealMapper.toPersistence(deal);
    const p = deal.toPersistence();
    const created = await this.ctx.prisma.deal.create({
      data: {
        id: d.id,
        title: d.title,
        value: d.value,
        stage: d.stage,
        pipelineId: d.pipelineId,
        pipelineStageId: d.pipelineStageId,
        contactId: d.contactId,
        companyId: d.companyId,
        expectedAt: d.expectedAt,
        closedAt: d.closedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
    return DealMapper.toDomain(created);
  }

  async update(deal: Deal): Promise<Deal> {
    const d = DealMapper.toPersistence(deal);
    const p = deal.toPersistence();
    try {
      const updated = await this.ctx.prisma.deal.update({
        where: { id: deal.id },
        data: {
          title: d.title,
          value: d.value,
          stage: d.stage,
          pipelineId: d.pipelineId,
          pipelineStageId: d.pipelineStageId,
          contactId: d.contactId,
          companyId: d.companyId,
          expectedAt: d.expectedAt,
          closedAt: d.closedAt,
          updatedAt: p.updatedAt,
        },
      });
      return DealMapper.toDomain(updated);
    } catch {
      throw new NotFoundError(`Deal ${deal.id} não encontrado`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.ctx.prisma.deal.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`Deal ${id} não encontrado`);
    }
  }

  async findById(id: string): Promise<Deal | null> {
    const row = await this.ctx.prisma.deal.findUnique({ where: { id } });
    return row ? DealMapper.toDomain(row) : null;
  }

  async list(params: ListDealsParams): Promise<ListDealsResult> {
    const { page, limit, stage, pipelineId } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.DealWhereInput = {
      ...(stage ? { stage } : {}),
      ...(pipelineId ? { pipelineId } : {}),
    };

    const [total, rows] = await Promise.all([
      this.ctx.prisma.deal.count({ where }),
      this.ctx.prisma.deal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => DealMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}
