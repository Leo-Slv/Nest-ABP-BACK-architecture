import { NotFoundError } from './not-found.error.js';

export class CompanyNotFoundError extends NotFoundError {
  constructor(companyId: string) {
    super(`Empresa ${companyId} não encontrada`);
  }
}
