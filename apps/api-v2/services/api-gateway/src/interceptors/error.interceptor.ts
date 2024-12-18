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
    return next.handle().pipe(
      catchError((err) => {
        this.logger.error(`Error occurred: ${err.message}`, err.stack);

        if (err instanceof HttpException) {
          return throwError(() => err);
        }

        if (err.code === 'ECONNREFUSED') {
          return throwError(
            () =>
              new HttpException(
                'Service unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
              ),
          );
        }

        return throwError(
          () =>
            new HttpException(
              'Internal server error',
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}
