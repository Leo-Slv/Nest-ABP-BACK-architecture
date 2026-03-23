import { NotFoundError } from './not-found.error.js';

export class PipelineNotFoundError extends NotFoundError {
  constructor(pipelineId: string) {
    super(`Pipeline ${pipelineId} não encontrado`);
  }
}
