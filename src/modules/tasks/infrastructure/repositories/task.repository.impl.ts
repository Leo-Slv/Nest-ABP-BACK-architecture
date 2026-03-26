import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { TaskMapper } from '../../application/mappers/task.mapper.js';
import type {
  ITaskRepository,
  ListTasksParams,
  ListTasksResult,
} from '../../domain/repositories/task.repository.js';
import { Task } from '../../domain/entities/task.entity.js';
import type { TransactionContext } from '../../../../shared/infrastructure/database/transaction-context.js';
import { Prisma } from '@prisma/client';

export class TaskSqlRepository implements ITaskRepository {
  constructor(private readonly ctx: TransactionContext) {}

  async create(task: Task): Promise<Task> {
    const d = TaskMapper.toPersistence(task);
    const p = task.toPersistence();
    const created = await this.ctx.prisma.task.create({
      data: {
        id: d.id,
        title: d.title,
        description: d.description,
        type: d.type,
        dueAt: d.dueAt,
        completedAt: d.completedAt,
        leadId: d.leadId,
        contactId: d.contactId,
        companyId: d.companyId,
        dealId: d.dealId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });
    return TaskMapper.toDomain(created);
  }

  async update(task: Task): Promise<Task> {
    const d = TaskMapper.toPersistence(task);
    const p = task.toPersistence();
    try {
      const updated = await this.ctx.prisma.task.update({
        where: { id: task.id },
        data: {
          title: d.title,
          description: d.description,
          type: d.type,
          dueAt: d.dueAt,
          completedAt: d.completedAt,
          leadId: d.leadId,
          contactId: d.contactId,
          companyId: d.companyId,
          dealId: d.dealId,
          updatedAt: p.updatedAt,
        },
      });
      return TaskMapper.toDomain(updated);
    } catch {
      throw new NotFoundError(`Tarefa ${task.id} não encontrada`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.ctx.prisma.task.delete({ where: { id } });
    } catch {
      throw new NotFoundError(`Tarefa ${id} não encontrada`);
    }
  }

  async findById(id: string): Promise<Task | null> {
    const row = await this.ctx.prisma.task.findUnique({ where: { id } });
    return row ? TaskMapper.toDomain(row) : null;
  }

  async list(params: ListTasksParams): Promise<ListTasksResult> {
    const { page, limit, type, dealId, contactId } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.TaskWhereInput = {
      ...(type ? { type } : {}),
      ...(dealId ? { dealId } : {}),
      ...(contactId ? { contactId } : {}),
    };

    const [total, rows] = await Promise.all([
      this.ctx.prisma.task.count({ where }),
      this.ctx.prisma.task.findMany({
        where,
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows.map((row) => TaskMapper.toDomain(row)),
      total,
      page,
      limit,
    };
  }
}
