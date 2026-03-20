import { Injectable, Inject } from '@nestjs/common';
import type {
  ITaskRepository,
  ListTasksResult,
} from '../../domain/repositories/task.repository.js';
import type { ListTasksDto } from '../dtos/list-tasks.dto.js';

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly repository: ITaskRepository,
  ) {}

  async execute(params: ListTasksDto): Promise<ListTasksResult> {
    return this.repository.list({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      type: params.type,
      dealId: params.dealId,
      contactId: params.contactId,
    });
  }
}
