import { Deal } from '../../domain/entities/deal.entity.js';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';

export type DealRow = {
  id: string;
  title: string;
  value: string | number;
  stage: string;
  pipelineId: string | null;
  pipelineStageId: string | null;
  contactId: string | null;
  companyId: string | null;
  expectedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class DealMapper {
  static toDomain(prisma: DealRow): Deal {
    return Deal.reconstitute({
      id: prisma.id,
      title: prisma.title,
      value: Number(prisma.value),
      stage: prisma.stage as DealStage,
      pipelineId: prisma.pipelineId,
      pipelineStageId: prisma.pipelineStageId,
      contactId: prisma.contactId,
      companyId: prisma.companyId,
      expectedAt: prisma.expectedAt,
      closedAt: prisma.closedAt,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
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
