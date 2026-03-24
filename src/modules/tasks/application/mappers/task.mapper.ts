import { Task } from '../../domain/entities/task.entity.js';
import { TaskType } from '../../domain/enums/task-type.enum.js';

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  dueAt: Date | null;
  completedAt: Date | null;
  leadId: string | null;
  contactId: string | null;
  companyId: string | null;
  dealId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class TaskMapper {
  static toDomain(prisma: TaskRow): Task {
    return Task.reconstitute({
      id: prisma.id,
      title: prisma.title,
      description: prisma.description,
      type: prisma.type as TaskType,
      dueAt: prisma.dueAt,
      completedAt: prisma.completedAt,
      leadId: prisma.leadId,
      contactId: prisma.contactId,
      companyId: prisma.companyId,
      dealId: prisma.dealId,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
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
