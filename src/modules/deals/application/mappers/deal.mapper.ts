import { Deal } from '../../domain/entities/deal.entity.js';
import type { Deal as PrismaDeal } from '@prisma/client';

export class DealMapper {
  static toDomain(prisma: PrismaDeal): Deal {
    return Deal.create({
      id: prisma.id,
      title: prisma.title,
      value: Number(prisma.value),
      stage: prisma.stage as Deal['props']['stage'],
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
}
