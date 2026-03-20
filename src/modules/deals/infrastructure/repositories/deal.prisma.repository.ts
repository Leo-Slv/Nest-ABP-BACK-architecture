import { Injectable, Inject } from '@nestjs/common';
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

  async create(data: {
    title: string;
    value?: number;
    stage?: DealStage;
    pipelineId?: string | null;
    pipelineStageId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    expectedAt?: Date | null;
  }): Promise<Deal> {
    const created = await this.prisma.deal.create({
      data: {
        title: data.title,
        value: data.value ?? 0,
        stage: data.stage ?? DealStage.LEAD,
        pipelineId: data.pipelineId ?? null,
        pipelineStageId: data.pipelineStageId ?? null,
        contactId: data.contactId ?? null,
        companyId: data.companyId ?? null,
        expectedAt: data.expectedAt ?? null,
      },
    });
    return DealMapper.toDomain(created);
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      value: number;
      stage: DealStage;
      pipelineId: string | null;
      pipelineStageId: string | null;
      contactId: string | null;
      companyId: string | null;
      expectedAt: Date | null;
      closedAt: Date | null;
    }>,
  ): Promise<Deal> {
    const updated = await this.prisma.deal.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.stage !== undefined && { stage: data.stage }),
        ...(data.pipelineId !== undefined && { pipelineId: data.pipelineId }),
        ...(data.pipelineStageId !== undefined && { pipelineStageId: data.pipelineStageId }),
        ...(data.contactId !== undefined && { contactId: data.contactId }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
        ...(data.expectedAt !== undefined && { expectedAt: data.expectedAt }),
        ...(data.closedAt !== undefined && { closedAt: data.closedAt }),
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

  async moveStage(
    dealId: string,
    stage: DealStage,
    pipelineStageId?: string | null,
  ): Promise<Deal> {
    const updateData: { stage: DealStage; pipelineStageId?: string | null; closedAt?: Date | null } = { stage };
    if (pipelineStageId !== undefined) updateData.pipelineStageId = pipelineStageId;
    if (stage === DealStage.WON || stage === DealStage.LOST) {
      updateData.closedAt = new Date();
    }
    return this.update(dealId, updateData);
  }
}
