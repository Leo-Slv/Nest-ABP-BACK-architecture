import { AppError } from './app-error.js';

export class NotFoundError extends AppError {
  /**
   * @param resourceOrMessage Nome do recurso (ex.: "Lead") quando `id` é passado; ou mensagem completa quando `id` é omitido.
   * @param id Quando informado, a mensagem será `${resourceOrMessage} com id ${id} não encontrado`.
   */
  constructor(resourceOrMessage: string, id?: string) {
    super(
      id !== undefined
        ? `${resourceOrMessage} com id ${id} não encontrado`
        : resourceOrMessage,
      404,
    );
  }
}
