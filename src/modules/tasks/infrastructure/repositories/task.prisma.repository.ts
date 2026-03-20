import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service.js';
import { TaskMapper } from '../../application/mappers/task.mapper.js';
import { TaskType } from '../../domain/enums/task-type.enum.js';
import type {
  ITaskRepository,
  ListTasksParams,
  ListTasksResult,
} from '../../domain/repositories/task.repository.js';
import { Task } from '../../domain/entities/task.entity.js';

@Injectable()
export class TaskPrismaRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string | null;
    type?: TaskType;
    dueAt?: Date | null;
    leadId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    dealId?: string | null;
  }): Promise<Task> {
    const created = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type ?? TaskType.CALL,
        dueAt: data.dueAt ?? null,
        leadId: data.leadId ?? null,
        contactId: data.contactId ?? null,
        companyId: data.companyId ?? null,
        dealId: data.dealId ?? null,
      },
    });
    return TaskMapper.toDomain(created);
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      type: TaskType;
      dueAt: Date | null;
      completedAt: Date | null;
      leadId: string | null;
      contactId: string | null;
      companyId: string | null;
      dealId: string | null;
    }>,
  ): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.dueAt !== undefined && { dueAt: data.dueAt }),
        ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
        ...(data.leadId !== undefined && { leadId: data.leadId }),
        ...(data.contactId !== undefined && { contactId: data.contactId }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
        ...(data.dealId !== undefined && { dealId: data.dealId }),
      },
    });
    return TaskMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async findById(id: string): Promise<Task | null> {
    const found = await this.prisma.task.findUnique({ where: { id } });
    return found ? TaskMapper.toDomain(found) : null;
  }

  async list(params: ListTasksParams): Promise<ListTasksResult> {
    const { page, limit, type, dealId, contactId } = params;
    const skip = (page - 1) * limit;

    const where: {
      type?: TaskType;
      dealId?: string;
      contactId?: string;
    } = {};
    if (type) where.type = type;
    if (dealId) where.dealId = dealId;
    if (contactId) where.contactId = contactId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueAt: 'asc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: data.map((t) => TaskMapper.toDomain(t)),
      total,
      page,
      limit,
    };
  }

  async complete(id: string): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id },
      data: { completedAt: new Date() },
    });
    return TaskMapper.toDomain(updated);
  }
}
