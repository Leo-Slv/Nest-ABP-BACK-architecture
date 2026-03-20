import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Deal } from '../../domain/entities/deal.entity.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';

@Injectable()
export class FindDealUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
  ) {}

  async execute(id: string): Promise<Deal> {
    const deal = await this.repository.findById(id);
    if (!deal) {
      throw new NotFoundError(`Deal ${id} não encontrado`);
    }
    return deal;
  }
}
