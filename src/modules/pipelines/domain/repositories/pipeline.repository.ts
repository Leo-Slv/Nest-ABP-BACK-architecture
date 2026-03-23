import { Pipeline } from '../entities/pipeline.entity.js';

export interface ListPipelinesResult {
  data: Pipeline[];
  total: number;
  page: number;
  limit: number;
}

export interface IPipelineRepository {
  create(pipeline: Pipeline): Promise<Pipeline>;
  update(pipeline: Pipeline): Promise<Pipeline>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Pipeline | null>;
  list(params: { page: number; limit: number }): Promise<ListPipelinesResult>;
}
