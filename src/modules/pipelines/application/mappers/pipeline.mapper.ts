import {
  Pipeline,
  PipelineStage,
} from '../../domain/entities/pipeline.entity.js';

export type PipelineStageRow = {
  id: string;
  name: string;
  order: number;
  pipelineId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PipelineRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stages?: PipelineStageRow[];
};

export class PipelineMapper {
  static stageToDomain(prisma: PipelineStageRow): PipelineStage {
    return PipelineStage.create({
      id: prisma.id,
      name: prisma.name,
      order: prisma.order,
      pipelineId: prisma.pipelineId,
    });
  }

  static toDomain(
    prisma: PipelineRow,
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
