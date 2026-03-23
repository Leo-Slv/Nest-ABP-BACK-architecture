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
  create(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Task | null>;
  list(params: ListTasksParams): Promise<ListTasksResult>;
}
