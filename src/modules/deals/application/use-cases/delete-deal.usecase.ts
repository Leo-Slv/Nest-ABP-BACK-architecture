import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import type { IDealRepository } from '../../domain/repositories/deal.repository.js';

@Injectable()
export class DeleteDealUseCase {
  constructor(
    @Inject('IDealRepository')
    private readonly repository: IDealRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deal = await this.repository.findById(id);
    if (!deal) {
      throw new NotFoundError(`Deal ${id} não encontrado`);
    }
    await this.repository.delete(id);
  }
}
