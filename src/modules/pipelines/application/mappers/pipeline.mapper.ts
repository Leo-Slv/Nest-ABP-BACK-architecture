import {
  Pipeline,
  PipelineStage,
} from '../../domain/entities/pipeline.entity.js';
import type { Pipeline as PrismaPipeline, PipelineStage as PrismaPipelineStage } from '@prisma/client';

export class PipelineMapper {
  static stageToDomain(row: PrismaPipelineStage): PipelineStage {
    return PipelineStage.create({
      id: row.id,
      name: row.name,
      order: row.order,
      pipelineId: row.pipelineId,
    });
  }

  static toDomain(
    prisma: PrismaPipeline & { stages?: PrismaPipelineStage[] },
  ): Pipeline {
    return Pipeline.reconstitute({
      id: prisma.id,
      name: prisma.name,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      stages: prisma.stages?.map((s) => ({
        id: s.id,
        name: s.name,
        order: s.order,
        pipelineId: s.pipelineId,
      })),
    });
  }
}
