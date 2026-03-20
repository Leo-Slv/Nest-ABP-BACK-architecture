import { Injectable, Inject } from '@nestjs/common';
import type {
  IDealRepository,
  ListDealsResult,
} from '../../domain/repositories/deal.repository.js';
import type { ListDealsDto } from '../dtos/list-deals.dto.js';

@Injectable()
export class ListDealsUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
  ) {}

  async execute(query: ListDealsDto): Promise<ListDealsResult> {
    return this.repository.list({
      page: query.page,
      limit: query.limit,
      stage: query.stage,
      pipelineId: query.pipelineId,
    });
  }
}
