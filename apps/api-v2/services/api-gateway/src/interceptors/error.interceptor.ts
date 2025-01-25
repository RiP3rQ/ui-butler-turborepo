import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { IncomingHttpHeaders } from 'node:http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface TypedRequest extends ExpressRequest {
  body: Record<string, unknown>;
  headers: IncomingHttpHeaders;
}

type SanitizedData = Record<string, string>;

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TypedRequest>();
    const { method, url, body, headers } = request;

    return next.handle().pipe(
      catchError((err: Error | HttpException) => {
        console.error(`Error in ${method} ${url}`, {
          error: err.message,
          stack: err.stack,
          body: this.sanitizeBody(body),
          headers: this.sanitizeHeaders(headers),
        });

        if (err instanceof HttpException) {
          return throwError(() => err);
        }

        const error = this.mapError(err);
        console.error('error', error);
        return throwError(() => error);
      }),
    );
  }

  private mapError(
    err: Error & {
      code?: string;
      name?: string;
      errors?: Record<string, unknown>;
    },
  ): HttpException {
    if (err.code === 'ECONNREFUSED') {
      return new HttpException(
        'Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (err.name === 'ValidationError') {
      return new HttpException(
        {
          message: 'Validation failed',
          errors: err.errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private sanitizeBody(
    body: Record<string, unknown> | undefined,
  ): SanitizedData {
    if (!body) return {};
    const sanitized = { ...body } as SanitizedData;
    ['password', 'token', 'secret'].forEach((key) => {
      if (key in sanitized) sanitized[key] = '***';
    });
    return sanitized;
  }

  private sanitizeHeaders(
    headers: Record<string, unknown> | undefined,
  ): SanitizedData {
    if (!headers) return {};
    const sanitized = { ...headers } as SanitizedData;
    ['authorization', 'cookie'].forEach((key) => {
      if (key in sanitized) sanitized[key] = '***';
    });
    return sanitized;
  }
}
