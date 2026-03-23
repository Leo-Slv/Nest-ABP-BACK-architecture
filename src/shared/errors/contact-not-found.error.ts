import { NotFoundError } from './not-found.error.js';

export class ContactNotFoundError extends NotFoundError {
  constructor(contactId: string) {
    super(`Contato ${contactId} não encontrado`);
  }
}
