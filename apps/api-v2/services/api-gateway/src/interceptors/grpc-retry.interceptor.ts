// src/interceptors/grpc-retry.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

@Injectable()
export class GrpcRetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcRetryInterceptor.name);
  // Default values instead of config
  private readonly maxRetries = 3;
  private readonly delayMs = 1000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let retries = 0;

    return next.handle().pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error) => {
            retries++;

            if (retries > this.maxRetries) {
              this.logger.error(
                `Failed after ${this.maxRetries} attempts: ${error.message}`,
                error.stack,
              );
              return throwError(() => error);
            }

            this.logger.warn(
              `gRPC call failed, attempt ${retries}/${this.maxRetries}. Retrying in ${this.delayMs}ms: ${error.message}`,
            );

            return timer(this.delayMs);
          }),
        ),
      ),
    );
  }
}
