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
  create(data: {
    name: string;
    email: string;
    phone?: string | null;
    source?: string | null;
    status?: LeadStatus;
    notes?: string | null;
  }): Promise<Lead>;
  update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string | null;
      source: string | null;
      status: LeadStatus;
      notes: string | null;
      contactId: string | null;
      convertedAt: Date | null;
    }>,
  ): Promise<Lead>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Lead | null>;
  findByEmail(email: string): Promise<Lead | null>;
  list(params: ListLeadsParams): Promise<ListLeadsResult>;
  convert(leadId: string): Promise<Lead>;
}
