import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "@upstash/redis";

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit(): Promise<void> {
    try {
      this.redisClient = new Redis({
        url: this.configService.getOrThrow("REDIS_URL"),
        token: this.configService.getOrThrow("REDIS_TOKEN"),
      });

      // Verify connection
      await this.redisClient.ping();
      console.log("Redis connection established successfully");
    } catch (error) {
      console.error("Failed to initialize Redis connection:", error);
      // Don't throw error to allow the application to start without Redis
      // The services will fallback to no-cache mode
    }
  }

  public getClient(): Redis {
    if (!this.redisClient) {
      console.warn("Redis client not initialized, creating new connection");
      this.redisClient = new Redis({
        url: this.configService.getOrThrow("redis.url"),
        token: this.configService.getOrThrow("redis.token"),
      });
    }
    return this.redisClient;
  }

  public isConnected(): boolean {
    return Boolean(this.redisClient);
  }
}
