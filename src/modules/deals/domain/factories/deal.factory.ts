import { Deal } from '../entities/deal.entity.js';
import { DealStage } from '../enums/deal-stage.enum.js';
import { DealValue } from '../value-objects/deal-value.vo.js';

export type CreateDealInput = {
  title: string;
  value?: number;
  stage?: DealStage;
  pipelineId?: string | null;
  pipelineStageId?: string | null;
  contactId?: string | null;
  companyId?: string | null;
  expectedAt?: string | null;
};

/**
 * Factory para criação do agregado `Deal`.
 * Centraliza parsing/normalização (valor/data) e defaults de estágio.
 */
export class DealFactory {
  create(input: CreateDealInput): Deal {
    const value = input.value !== undefined ? new DealValue(input.value).value : 0;

    return Deal.createNew({
      title: input.title,
      value,
      stage: input.stage ?? DealStage.LEAD,
      pipelineId: input.pipelineId ?? null,
      pipelineStageId: input.pipelineStageId ?? null,
      contactId: input.contactId ?? null,
      companyId: input.companyId ?? null,
      expectedAt: input.expectedAt ? new Date(input.expectedAt) : null,
    });
  }
}

