import { NotFoundError } from './not-found.error.js';

export class DealNotFoundError extends NotFoundError {
  constructor(dealId: string) {
    super(`Deal ${dealId} não encontrado`);
  }
}
