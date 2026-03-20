import { Pipeline } from '../entities/pipeline.entity.js';

export interface ListPipelinesResult {
  data: Pipeline[];
  total: number;
  page: number;
  limit: number;
}

export interface IPipelineRepository {
  create(data: { name: string; stages?: { name: string; order: number }[] }): Promise<Pipeline>;
  update(id: string, data: { name?: string }): Promise<Pipeline>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Pipeline | null>;
  list(params: { page: number; limit: number }): Promise<ListPipelinesResult>;
}
