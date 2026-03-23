import { NotFoundError } from './not-found.error.js';

export class TaskNotFoundError extends NotFoundError {
  constructor(taskId: string) {
    super(`Tarefa ${taskId} não encontrada`);
  }
}
