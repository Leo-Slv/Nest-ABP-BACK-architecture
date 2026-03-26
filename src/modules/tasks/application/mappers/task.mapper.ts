import { Task } from '../../domain/entities/task.entity.js';
import { TaskType } from '../../domain/enums/task-type.enum.js';
import type { Task as PrismaTask } from '@prisma/client';

export class TaskMapper {
  static toDomain(row: PrismaTask): Task {
    return Task.reconstitute({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type as unknown as TaskType,
      dueAt: row.dueAt,
      completedAt: row.completedAt,
      leadId: row.leadId,
      contactId: row.contactId,
      companyId: row.companyId,
      dealId: row.dealId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(task: Task): {
    id: string;
    title: string;
    description: string | null;
    type: TaskType;
    dueAt: Date | null;
    completedAt: Date | null;
    leadId: string | null;
    contactId: string | null;
    companyId: string | null;
    dealId: string | null;
  } {
    const p = task.toPersistence();
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      type: p.type as TaskType,
      dueAt: p.dueAt,
      completedAt: p.completedAt,
      leadId: p.leadId,
      contactId: p.contactId,
      companyId: p.companyId,
      dealId: p.dealId,
    };
  }
}
