import { Injectable, Inject } from '@nestjs/common';
import type {
  ILeadRepository,
  ListLeadsResult,
} from '../../domain/repositories/lead.repository.js';
import type { ListLeadsDto } from '../dtos/list-leads.dto.js';
import { LeadStatus } from '../../domain/enums/lead-status.enum.js';

@Injectable()
export class ListLeadsUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly repository: ILeadRepository,
  ) {}

  async execute(params: ListLeadsDto): Promise<ListLeadsResult> {
    return this.repository.list({
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status as LeadStatus | undefined,
    });
  }
}
