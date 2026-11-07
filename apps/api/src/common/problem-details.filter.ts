import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  code: string;
  [extension: string]: unknown;
}

/**
 * Renders every error as RFC 9457 problem+json with a stable `code`
 * that clients can switch on (messages are for humans and may change).
 */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const problem = this.toProblem(exception, request.originalUrl);
    if (problem.status >= 500) {
      this.logger.error(exception);
    }
    response.status(problem.status).type('application/problem+json').json(problem);
  }

  private toProblem(exception: unknown, instance: string): ProblemDetails {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const extra = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
      const message = typeof body === 'string' ? body : extra['message'];
      const { message: _message, statusCode: _statusCode, error: _error, code, ...rest } = extra;
      return {
        type: 'about:blank',
        title: HttpStatus[status] ?? 'Error',
        status,
        detail: Array.isArray(message) ? message.join('; ') : (message as string | undefined),
        instance,
        code: typeof code === 'string' ? code : (HttpStatus[status] ?? 'ERROR'),
        ...rest,
      };
    }

    return {
      type: 'about:blank',
      title: 'INTERNAL_SERVER_ERROR',
      status: 500,
      detail: 'Something went wrong on our side.',
      instance,
      code: 'INTERNAL_ERROR',
    };
  }
}
