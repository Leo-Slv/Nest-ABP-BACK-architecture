import { DomainError } from './domain-error.js';

export class InvalidEmailError extends DomainError {
  constructor(value: string) {
    super(`Email inválido: ${value}`);
  }
}
