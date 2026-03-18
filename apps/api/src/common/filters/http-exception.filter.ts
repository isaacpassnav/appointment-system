import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string }>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    const payload =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, unknown>);

    if (!isHttpException) {
      const error = exception instanceof Error ? exception : null;
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url} (requestId=${request.requestId ?? 'n/a'})`,
        error?.stack ?? JSON.stringify(exception),
      );
    }

    response.status(status).json({
      success: false,
      requestId: request.requestId ?? null,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        statusCode: status,
        message: payload.message ?? 'Unexpected error',
        details: payload,
      },
    });
  }
}
