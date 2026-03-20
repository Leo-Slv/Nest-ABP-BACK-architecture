import { Contact } from '../entities/contact.entity.js';

export interface ListContactsParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ListContactsResult {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
}

export interface IContactRepository {
  create(data: {
    name: string;
    email: string;
    phone?: string | null;
    role?: string | null;
    companyId?: string | null;
  }): Promise<Contact>;
  update(id: string, data: Partial<Contact['props']>): Promise<Contact>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Contact | null>;
  findByEmail(email: string): Promise<Contact | null>;
  list(params: ListContactsParams): Promise<ListContactsResult>;
}
