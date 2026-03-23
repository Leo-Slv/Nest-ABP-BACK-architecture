import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service.js';
import { DealMapper } from '../../application/mappers/deal.mapper.js';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';
import type {
  IDealRepository,
  ListDealsParams,
  ListDealsResult,
} from '../../domain/repositories/deal.repository.js';
import { Deal } from '../../domain/entities/deal.entity.js';

@Injectable()
export class DealPrismaRepository implements IDealRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(deal: Deal): Promise<Deal> {
    const data = DealMapper.toPersistence(deal);
    const created = await this.prisma.deal.create({
      data: {
        id: data.id,
        title: data.title,
        value: data.value,
        stage: data.stage ?? DealStage.LEAD,
        pipelineId: data.pipelineId ?? null,
        pipelineStageId: data.pipelineStageId ?? null,
        contactId: data.contactId ?? null,
        companyId: data.companyId ?? null,
        expectedAt: data.expectedAt ?? null,
        closedAt: data.closedAt ?? null,
      },
    });
    return DealMapper.toDomain(created);
  }

  async update(deal: Deal): Promise<Deal> {
    const data = DealMapper.toPersistence(deal);
    const updated = await this.prisma.deal.update({
      where: { id: deal.id },
      data: {
        title: data.title,
        value: data.value,
        stage: data.stage,
        pipelineId: data.pipelineId,
        pipelineStageId: data.pipelineStageId,
        contactId: data.contactId,
        companyId: data.companyId,
        expectedAt: data.expectedAt,
        closedAt: data.closedAt,
      },
    });
    return DealMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deal.delete({ where: { id } });
  }

  async findById(id: string): Promise<Deal | null> {
    const found = await this.prisma.deal.findUnique({ where: { id } });
    return found ? DealMapper.toDomain(found) : null;
  }

  async list(params: ListDealsParams): Promise<ListDealsResult> {
    const { page, limit, stage, pipelineId } = params;
    const skip = (page - 1) * limit;

    const where: { stage?: DealStage; pipelineId?: string } = {};
    if (stage) where.stage = stage;
    if (pipelineId) where.pipelineId = pipelineId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      data: data.map((d) => DealMapper.toDomain(d)),
      total,
      page,
      limit,
    };
  }
}
