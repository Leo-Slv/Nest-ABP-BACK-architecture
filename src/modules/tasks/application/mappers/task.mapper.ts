import { Task } from '../../domain/entities/task.entity.js';
import type { Task as PrismaTask } from '@prisma/client';

export class TaskMapper {
  static toDomain(prisma: PrismaTask): Task {
    return Task.create({
      id: prisma.id,
      title: prisma.title,
      description: prisma.description,
      type: prisma.type as Task['props']['type'],
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
}
