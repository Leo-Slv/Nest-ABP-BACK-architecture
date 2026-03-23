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

  async create(task: Task): Promise<Task> {
    const data = TaskMapper.toPersistence(task);
    const created = await this.prisma.task.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description ?? null,
        type: data.type ?? TaskType.CALL,
        dueAt: data.dueAt ?? null,
        completedAt: data.completedAt ?? null,
        leadId: data.leadId ?? null,
        contactId: data.contactId ?? null,
        companyId: data.companyId ?? null,
        dealId: data.dealId ?? null,
      },
    });
    return TaskMapper.toDomain(created);
  }

  async update(task: Task): Promise<Task> {
    const data = TaskMapper.toPersistence(task);
    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        dueAt: data.dueAt ?? null,
        completedAt: data.completedAt ?? null,
        leadId: data.leadId ?? null,
        contactId: data.contactId ?? null,
        companyId: data.companyId ?? null,
        dealId: data.dealId ?? null,
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
}
