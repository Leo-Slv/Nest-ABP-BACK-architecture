import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service.js';
import { PipelineMapper } from '../../application/mappers/pipeline.mapper.js';
import type {
  IPipelineRepository,
  ListPipelinesResult,
} from '../../domain/repositories/pipeline.repository.js';

@Injectable()
export class PipelinePrismaRepository implements IPipelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    stages?: { name: string; order: number }[];
  }): Promise<import('../../domain/entities/pipeline.entity.js').Pipeline> {
    const created = await this.prisma.pipeline.create({
      data: {
        name: data.name,
        stages:
          data.stages?.length ?? 0 > 0
            ? {
                create: data.stages!.map((s) => ({ name: s.name, order: s.order })),
              }
            : undefined,
      },
      include: { stages: true },
    });
    return PipelineMapper.toDomain(created);
  }

  async update(id: string, data: { name?: string }): Promise<import('../../domain/entities/pipeline.entity.js').Pipeline> {
    const existing = await this.prisma.pipeline.findUnique({ where: { id } });
    if (!existing) throw new Error('Pipeline not found');
    const updated = await this.prisma.pipeline.update({
      where: { id },
      data: { name: data.name ?? existing.name },
      include: { stages: true },
    });
    return PipelineMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pipeline.delete({ where: { id } });
  }

  async findById(id: string): Promise<import('../../domain/entities/pipeline.entity.js').Pipeline | null> {
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
