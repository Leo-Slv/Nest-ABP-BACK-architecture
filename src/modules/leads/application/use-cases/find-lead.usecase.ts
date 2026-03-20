import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';

@Injectable()
export class FindLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
  ) {}

  async execute(id: string): Promise<Lead> {
    const lead = await this.repository.findById(id);
    if (!lead) {
      throw new NotFoundError(`Lead ${id} não encontrado`);
    }
    return lead;
  }
}
