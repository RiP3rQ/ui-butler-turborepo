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
import { GrpcRetryConfig } from '../config/grpc-retry.config';

@Injectable()
export class GrpcRetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GrpcRetryInterceptor.name);

  constructor(private config: GrpcRetryConfig) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let retries = 0;

    return next.handle().pipe(
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error) => {
            retries++;

            if (retries > this.config.maxRetries) {
              this.logger.error(
                `Failed after ${this.config.maxRetries} attempts: ${error.message}`,
                error.stack,
              );
              return throwError(() => error);
            }

            this.logger.warn(
              `gRPC call failed, attempt ${retries}/${this.config.maxRetries}. Retrying in ${this.config.delayMs}ms: ${error.message}`,
            );

            return timer(this.config.delayMs);
          }),
        ),
      ),
    );
  }
}
