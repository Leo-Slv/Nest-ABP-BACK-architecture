import { Injectable } from '@nestjs/common';
import { PipelineNotFoundError } from '../../../../shared/errors/pipeline-not-found.error.js';
import { PrismaService } from '../../../../shared/database/prisma.service.js';
import { PipelineMapper } from '../../application/mappers/pipeline.mapper.js';
import type {
  IPipelineRepository,
  ListPipelinesResult,
} from '../../domain/repositories/pipeline.repository.js';
import { Pipeline } from '../../domain/entities/pipeline.entity.js';

@Injectable()
export class PipelinePrismaRepository implements IPipelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(pipeline: Pipeline): Promise<Pipeline> {
    const stages = pipeline.getPendingStagesForCreate();
    const created = await this.prisma.pipeline.create({
      data: {
        id: pipeline.id,
        name: pipeline.name,
        stages:
          stages.length > 0
            ? {
                create: stages.map((s) => ({ name: s.name, order: s.order })),
              }
            : undefined,
      },
      include: { stages: true },
    });
    return PipelineMapper.toDomain(created);
  }

  async update(pipeline: Pipeline): Promise<Pipeline> {
    const existing = await this.prisma.pipeline.findUnique({ where: { id: pipeline.id } });
    if (!existing) throw new PipelineNotFoundError(pipeline.id);
    const updated = await this.prisma.pipeline.update({
      where: { id: pipeline.id },
      data: { name: pipeline.name },
      include: { stages: true },
    });
    return PipelineMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pipeline.delete({ where: { id } });
  }

  async findById(id: string): Promise<Pipeline | null> {
    const found = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { stages: true },
    });
    return found ? PipelineMapper.toDomain(found) : null;
  }

  async list(params: { page: number; limit: number }): Promise<ListPipelinesResult> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.pipeline.findMany({
        skip,
        take: limit,
        include: { stages: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pipeline.count(),
    ]);

    return {
      data: data.map((p) => PipelineMapper.toDomain(p)),
      total,
      page,
      limit,
    };
  }
}
