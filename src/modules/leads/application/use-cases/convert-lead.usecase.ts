import { Injectable, Inject } from '@nestjs/common';
import { ConflictError } from '../../../../shared/errors/conflict.error.js';
import { NotFoundError } from '../../../../shared/errors/not-found.error.js';
import { Lead } from '../../domain/entities/lead.entity.js';
import type { ILeadRepository } from '../../domain/repositories/lead.repository.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

@Injectable()
export class ConvertLeadUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
  ) {}

  async execute(leadId: string): Promise<Lead> {
    const lead = await this.repository.findById(leadId);
    if (!lead) {
      throw new NotFoundError(`Lead ${leadId} não encontrado`);
    }
    if (lead.status === LeadStatus.CONVERTED) {
      throw new ConflictError('Lead já foi convertido');
    }
    return this.repository.convert(leadId);
  }
}
