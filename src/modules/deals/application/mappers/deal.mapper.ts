import { Deal } from '../../domain/entities/deal.entity.js';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';
import type { Deal as PrismaDeal } from '@prisma/client';

export class DealMapper {
  static toDomain(row: PrismaDeal): Deal {
    return Deal.reconstitute({
      id: row.id,
      title: row.title,
      value: Number(row.value),
      stage: row.stage as unknown as DealStage,
      pipelineId: row.pipelineId,
      pipelineStageId: row.pipelineStageId,
      contactId: row.contactId,
      companyId: row.companyId,
      expectedAt: row.expectedAt,
      closedAt: row.closedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(deal: Deal): {
    id: string;
    title: string;
    value: number;
    stage: DealStage;
    pipelineId: string | null;
    pipelineStageId: string | null;
    contactId: string | null;
    companyId: string | null;
    expectedAt: Date | null;
    closedAt: Date | null;
  } {
    const p = deal.toPersistence();
    return {
      id: p.id,
      title: p.title,
      value: p.value,
      stage: p.stage as DealStage,
      pipelineId: p.pipelineId,
      pipelineStageId: p.pipelineStageId,
      contactId: p.contactId,
      companyId: p.companyId,
      expectedAt: p.expectedAt,
      closedAt: p.closedAt,
    };
  }
}
