import {
  Pipeline,
  PipelineStage,
} from '../../domain/entities/pipeline.entity.js';
import type { Pipeline as PrismaPipeline, PipelineStage as PrismaStage } from '@prisma/client';

export class PipelineMapper {
  static stageToDomain(prisma: PrismaStage): PipelineStage {
    return PipelineStage.create({
      id: prisma.id,
      name: prisma.name,
      order: prisma.order,
      pipelineId: prisma.pipelineId,
    });
  }

  static toDomain(
    prisma: PrismaPipeline & { stages?: PrismaStage[] },
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
