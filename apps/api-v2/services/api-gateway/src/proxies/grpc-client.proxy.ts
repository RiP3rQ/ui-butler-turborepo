import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';
import { status } from '@grpc/grpc-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GrpcClientProxy {
  private readonly logger = new Logger(GrpcClientProxy.name);
  private readonly maxRetries: number;
  private readonly delayMs: number;

  constructor(private configService: ConfigService) {
    this.maxRetries = this.configService.get('GRPC_MAX_RETRIES', 3);
    this.delayMs = this.configService.get('GRPC_RETRY_DELAY_MS', 1000);
  }

  async call<T>(serviceCall: Observable<T>, context: string): Promise<T> {
    let retries = 0;

    return firstValueFrom(
      serviceCall.pipe(
        retryWhen((errors) =>
          errors.pipe(
            mergeMap((error) => {
              this.logger.debug(`Received error in ${context}:`, error);

              if (!this.isRetryableError(error)) {
                return throwError(() => error);
              }

              retries++;

              if (retries >= this.maxRetries) {
                this.logger.error(
                  `${context} failed after ${retries} attempts: ${error.message}`,
                );
                return throwError(() => error);
              }

              this.logger.warn(
                `${context} failed, attempt ${retries}/${this.maxRetries}. Retrying in ${this.delayMs}ms: ${error.message}`,
              );

              return timer(this.delayMs);
            }),
          ),
        ),
      ),
    );
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      status.UNAVAILABLE,
      status.DEADLINE_EXCEEDED,
      status.RESOURCE_EXHAUSTED,
      status.INTERNAL,
    ];

    const isRetryable =
      error?.code !== undefined &&
      retryableCodes.includes(error.code) &&
      error?.details !== undefined;

    this.logger.debug('Error details:', {
      code: error?.code,
      details: error?.details,
      isRetryable,
    });

    return isRetryable;
  }
}
