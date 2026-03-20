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
  create(data: {
    title: string;
    value?: number;
    stage?: DealStage;
    pipelineId?: string | null;
    pipelineStageId?: string | null;
    contactId?: string | null;
    companyId?: string | null;
    expectedAt?: Date | null;
  }): Promise<Deal>;
  update(
    id: string,
    data: Partial<{
      title: string;
      value: number;
      stage: DealStage;
      pipelineId: string | null;
      pipelineStageId: string | null;
      contactId: string | null;
      companyId: string | null;
      expectedAt: Date | null;
      closedAt: Date | null;
    }>,
  ): Promise<Deal>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Deal | null>;
  list(params: ListDealsParams): Promise<ListDealsResult>;
  moveStage(dealId: string, stage: DealStage, pipelineStageId?: string | null): Promise<Deal>;
}
