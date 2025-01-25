import { status } from '@grpc/grpc-js';
import { GrpcError } from '@microservices/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

@Injectable()
export class GrpcClientProxy {
  private readonly logger = new Logger(GrpcClientProxy.name);
  private readonly maxRetries: number;
  private readonly delayMs: number;

  constructor(private configService: ConfigService) {
    this.maxRetries = this.configService.get('GRPC_MAX_RETRIES', 3);
    this.delayMs = this.configService.get('GRPC_RETRY_DELAY_MS', 1000);
  }

  public async call<T>(
    serviceCall: Observable<T>,
    context: string,
  ): Promise<T> {
    let retries = 0;

    return firstValueFrom(
      serviceCall.pipe(
        retryWhen((errors) =>
          errors.pipe(
            mergeMap((error: GrpcError) => {
              console.error(`Received error in ${context}:`, error);

              if (!this.isRetryableError(error)) {
                return throwError(() => error);
              }

              retries++;

              if (retries >= this.maxRetries) {
                this.logger.error(
                  `${context} failed after ${String(retries)} attempts: ${error.message}`,
                );
                return throwError(() => error);
              }

              this.logger.warn(
                `${context} failed, attempt ${String(retries)}/${String(this.maxRetries)}. Retrying in ${String(this.delayMs)}ms: ${error.message}`,
              );

              return timer(this.delayMs);
            }),
          ),
        ),
      ),
    );
  }

  private isRetryableError(error: GrpcError): boolean {
    const retryableCodes = [
      status.UNAVAILABLE,
      status.DEADLINE_EXCEEDED,
      status.RESOURCE_EXHAUSTED,
      status.INTERNAL,
    ];

    const isRetryable =
      error.code !== undefined &&
      retryableCodes.includes(error.code) &&
      error.details !== undefined;

    this.logger.debug('Error details:', {
      code: error.code,
      details: error.details,
      isRetryable,
    });

    return isRetryable;
  }
}
