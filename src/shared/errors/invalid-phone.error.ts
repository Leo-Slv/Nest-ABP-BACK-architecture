import { DomainError } from './domain-error.js';

export class InvalidPhoneError extends DomainError {
  constructor(value: string) {
    super(`Telefone inválido: ${value}`);
  }
}
