import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';

export class BaseProxyService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly client: ClientProxy,
    private readonly serviceName: string,
  ) {}

  protected async send<T>(pattern: string, data: any): Promise<T> {
    try {
      const response = await firstValueFrom(this.client.send<T>(pattern, data));
      return response;
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(
          `Error in ${this.serviceName} service: ${err.message}`,
          err.stack,
        );
      }
      throw err;
    }
  }
}
