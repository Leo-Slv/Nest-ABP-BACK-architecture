import { AppError } from './app-error.js';

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} com id ${id} não encontrado` : `${resource} não encontrado`,
      404,
    );
  }
}
