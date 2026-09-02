import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}

const HTTP_STATUS_NAMES = new Set<string>();
for (const value of Object.values(HttpStatus)) {
  if (typeof value === 'string') HTTP_STATUS_NAMES.add(value.toLowerCase());
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        code = this.httpStatusToCode(statusCode);
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        message = obj.message || exception.message;
        if (Array.isArray(message)) {
          // class-validator returns string[] for validation errors
          errors = { body: message };
          message = 'Validation failed';
        }
        code = this.extractCode(statusCode, obj);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = 'INTERNAL_SERVER_ERROR';
    }

    const body: ErrorResponse = { statusCode, code, message };
    if (errors) body.errors = errors;

    console.error('[AllExceptionsFilter]', exception);

    response.status(statusCode).json(body);
  }

  private extractCode(statusCode: number, obj: any): string {
    if (typeof obj.code === 'string' && obj.code) return obj.code;
    // Nest.js stores custom HttpException codes in `error` (e.g. 'OTP_INVALID')
    if (
      typeof obj.error === 'string' &&
      obj.error &&
      !HTTP_STATUS_NAMES.has(obj.error.toLowerCase())
    ) {
      return obj.error;
    }
    return this.httpStatusToCode(statusCode);
  }

  private httpStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return map[status] || 'ERROR';
  }
}
