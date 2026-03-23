import { DomainError } from './domain-error.js';

export class InvalidNameError extends DomainError {
  constructor(value: string) {
    super(`Nome inválido: ${value}`);
  }
}
