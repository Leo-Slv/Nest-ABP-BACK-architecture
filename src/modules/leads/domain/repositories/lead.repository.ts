import { Lead } from '../entities/lead.entity.js';
import { LeadStatus } from '../enums/lead-status.enum.js';

export interface ListLeadsParams {
  page: number;
  limit: number;
  search?: string;
  status?: LeadStatus;
}

export interface ListLeadsResult {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface ILeadRepository {
  create(lead: Lead): Promise<Lead>;
  update(lead: Lead): Promise<Lead>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Lead | null>;
  findByEmail(email: string): Promise<Lead | null>;
  list(params: ListLeadsParams): Promise<ListLeadsResult>;
  convert(leadId: string): Promise<Lead>;
}
