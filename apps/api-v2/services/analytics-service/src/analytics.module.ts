import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // DB connection
    DatabaseModule,
    // CONFIG
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),

        ANALYTICS_SERVICE_HOST: Joi.string().required(),
        ANALYTICS_SERVICE_PORT: Joi.number().required(),
      }),
    }),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
