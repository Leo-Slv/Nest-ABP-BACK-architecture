import { Task } from '../entities/task.entity.js';
import { TaskType } from '../enums/task-type.enum.js';

export interface ListTasksParams {
  page: number;
  limit: number;
  type?: TaskType;
  dealId?: string;
  contactId?: string;
}

export interface ListTasksResult {
  data: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface ITaskRepository {
  create(data: {
    title: string;
    description?: string | null;
    type?: TaskType;
    dueAt?: Date | null;
    leadId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    dealId?: string | null;
  }): Promise<Task>;
  update(
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
  ): Promise<Task>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Task | null>;
  list(params: ListTasksParams): Promise<ListTasksResult>;
  complete(id: string): Promise<Task>;
}
