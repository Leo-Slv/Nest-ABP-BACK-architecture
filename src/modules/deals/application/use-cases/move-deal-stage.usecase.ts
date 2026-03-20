import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Deal } from '../../domain/entities/deal.entity.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';
import type { MoveStageDto } from '../dtos/move-stage.dto.js';

@Injectable()
export class MoveDealStageUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
  ) {}

  async execute(dealId: string, dto: MoveStageDto): Promise<Deal> {
    const deal = await this.repository.findById(dealId);
    if (!deal) {
      throw new NotFoundError(`Deal ${dealId} não encontrado`);
    }

    return this.repository.moveStage(
      dealId,
      dto.stage as import('../../domain/enums/deal-stage.enum.js').DealStage,
      dto.pipelineStageId ?? null,
    );
  }
}
