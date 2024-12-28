import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GrpcRetryConfig {
  constructor(private configService: ConfigService) {}

  get maxRetries(): number {
    return this.configService.get('GRPC_MAX_RETRIES', 3);
  }

  get delayMs(): number {
    return this.configService.get('GRPC_RETRY_DELAY_MS', 1000);
  }
}
