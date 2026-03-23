import { Deal } from '../entities/deal.entity.js';
import { DealStage } from '../enums/deal-stage.enum.js';

export interface ListDealsParams {
  page: number;
  limit: number;
  stage?: DealStage;
  pipelineId?: string;
}

export interface ListDealsResult {
  data: Deal[];
  total: number;
  page: number;
  limit: number;
}

export interface IDealRepository {
  create(deal: Deal): Promise<Deal>;
  update(deal: Deal): Promise<Deal>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Deal | null>;
  list(params: ListDealsParams): Promise<ListDealsResult>;
}
