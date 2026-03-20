import { Injectable, Inject } from '@nestjs/common';
import { Deal } from '../../domain/entities/deal.entity.js';
import { DealValue } from '../../domain/value-objects/deal-value.vo.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import type { CreateDealDto } from '../dtos/create-deal.dto.js';
import { DealStage } from '../../domain/enums/deal-stage.enum.js';

@Injectable()
export class CreateDealUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
  ) {}

  async execute(dto: CreateDealDto): Promise<Deal> {
    const value = dto.value !== undefined ? new DealValue(dto.value).value : 0;

    return this.repository.create({
      title: dto.title,
      value,
      stage: dto.stage ?? DealStage.LEAD,
      pipelineId: dto.pipelineId ?? null,
      pipelineStageId: dto.pipelineStageId ?? null,
      contactId: dto.contactId ?? null,
      companyId: dto.companyId ?? null,
      expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : null,
    });
  }
}
