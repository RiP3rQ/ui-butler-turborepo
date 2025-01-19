import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GrpcRetryConfig {
  constructor(private configService: ConfigService) {}

  public get maxRetries(): number {
    return this.configService.getOrThrow('GRPC_MAX_RETRIES', 3);
  }

  public get delayMs(): number {
    return this.configService.getOrThrow('GRPC_RETRY_DELAY_MS', 1000);
  }
}
