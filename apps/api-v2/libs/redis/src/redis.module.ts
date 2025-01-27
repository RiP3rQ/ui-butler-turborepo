import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { redisConfig } from "./config/redis.config";
import { RedisService } from "./redis.service";
import { REDIS_CONNECTION } from "./config/connection-name";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [redisConfig],
    }),
  ],
  providers: [
    RedisService,
    {
      provide: REDIS_CONNECTION,
      useExisting: RedisService,
    },
  ],
  exports: [REDIS_CONNECTION, RedisService],
})
export class RedisModule {}
