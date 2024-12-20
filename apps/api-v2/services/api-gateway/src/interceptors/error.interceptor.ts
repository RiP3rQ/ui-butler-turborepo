import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;

    return next.handle().pipe(
      catchError((err) => {
        this.logger.error(`Error in ${method} ${url}`, {
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

  private mapError(err: any): HttpException {
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

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    ['password', 'token', 'secret'].forEach((key) => {
      if (sanitized[key]) sanitized[key] = '***';
    });
    return sanitized;
  }

  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;
    const sanitized = { ...headers };
    ['authorization', 'cookie'].forEach((key) => {
      if (sanitized[key]) sanitized[key] = '***';
    });
    return sanitized;
  }
}
