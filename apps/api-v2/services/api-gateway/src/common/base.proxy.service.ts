import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError, timer } from 'rxjs';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { retry, timeout } from 'rxjs/operators';

export class BaseProxyService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds
  private readonly MAX_RETRIES = 3;

  constructor(
    protected readonly client: ClientProxy,
    private readonly serviceName: string,
  ) {}

  protected async send<T>(
    pattern: string,
    data: any,
    options: { timeout?: number; retries?: number } = {},
  ): Promise<T> {
    const {
      timeout: customTimeout = this.DEFAULT_TIMEOUT,
      retries = this.MAX_RETRIES,
    } = options;

    try {
      const response = await firstValueFrom(
        this.client.send<T>(pattern, data).pipe(
          timeout(customTimeout),
          retry({
            count: retries,
            delay: (error, retryCount) => {
              this.logger.warn(
                `Retrying ${pattern} (${retryCount}/${retries}) after error: ${error.message}`,
              );
              return timer(Math.pow(2, retryCount) * 1000); // Exponential backoff
            },
          }),
        ),
      );
      return response;
    } catch (err) {
      this.handleError(err, pattern);
    }
  }

  private handleError(err: any, pattern: string): never {
    this.logger.error(
      `Error in ${this.serviceName} service (${pattern}): ${err.message}`,
      err.stack,
    );

    if (err instanceof TimeoutError) {
      throw new HttpException(
        `${this.serviceName} service timeout`,
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    if (err.code === 'ECONNREFUSED') {
      throw new HttpException(
        `${this.serviceName} service unavailable`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (err instanceof HttpException) {
      throw err;
    }

    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
