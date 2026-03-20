import { AppError } from './app-error.js';

export class DomainError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
