import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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
