import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { NotFoundError } from '../errors/not-found.error.js';
import { ConflictError } from '../errors/conflict.error.js';
import { DomainError } from '../errors/domain-error.js';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string;

    if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof DomainError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof ZodValidationException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      const zodError = exception.getZodError();
      const issues = zodError instanceof ZodError ? zodError.issues : [];
      message =
        Array.isArray(issues) && issues.length > 0
          ? issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
          : 'Dados inválidos';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno do servidor';
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
