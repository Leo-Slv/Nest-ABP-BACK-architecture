import { Task } from '../entities/task.entity.js';
import { TaskType } from '../enums/task-type.enum.js';

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  type?: TaskType;
  dueAt?: string | null;
  leadId?: string | null;
  contactId?: string | null;
  companyId?: string | null;
  dealId?: string | null;
};

/**
 * Factory para criação do agregado `Task`.
 * Centraliza defaults, parsing de datas e inicialização de invariantes do agregado.
 */
export class TaskFactory {
  create(input: CreateTaskInput): Task {
    return Task.createNew({
      title: input.title,
      description: input.description ?? null,
      type: input.type ?? TaskType.CALL,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      leadId: input.leadId ?? null,
      contactId: input.contactId ?? null,
      companyId: input.companyId ?? null,
      dealId: input.dealId ?? null,
    });
  }
}

