import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorLoggerInterceptor<T> implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;

    return next.handle().pipe(
      catchError((error) => {
        this.logger.error({
          message: 'Request failed',
          error: {
            message: error.message,
            stack: error.stack,
          },
          request: {
            method,
            url,
            body,
            headers,
          },
        });

        return throwError(() => error);
      }),
    );
  }
}
