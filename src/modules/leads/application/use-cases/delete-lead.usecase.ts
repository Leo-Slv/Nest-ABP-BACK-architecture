import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';

@Injectable()
export class DeleteLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const lead = await this.repository.findById(id);
    if (!lead) {
      throw new NotFoundError(`Lead ${id} não encontrado`);
    }
    await this.repository.delete(id);
  }
}
