import { Injectable, Inject } from '@nestjs/common';
import type { IPipelineRepository, ListPipelinesResult } from '../../domain/repositories/pipeline.repository.js';

@Injectable()
export class ListPipelinesUseCase {
  constructor(
    @Inject('IPipelineRepository')
    private readonly repository: IPipelineRepository,
  ) {}

  async execute(params: { page?: number; limit?: number } = {}): Promise<ListPipelinesResult> {
    return this.repository.list({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    });
  }
}
