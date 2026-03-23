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
  create(contact: Contact): Promise<Contact>;
  update(contact: Contact): Promise<Contact>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Contact | null>;
  findByEmail(email: string): Promise<Contact | null>;
  list(params: ListContactsParams): Promise<ListContactsResult>;
}
