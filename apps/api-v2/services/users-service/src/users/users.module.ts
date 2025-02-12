import { DatabaseModule } from '@microservices/database';
import { Module } from '@nestjs/common';
import { CredentialsController } from '../credentials/credentials.controller';
import { CredentialsService } from '../credentials/credentials.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        USERS_SERVICE_HOST: Joi.string().required(),
        USERS_SERVICE_PORT: Joi.number().required(),
        ENCRYPTION_KEY: Joi.string().required(),
      }),
    }),
  ],
  controllers: [UsersController, CredentialsController],
  providers: [UsersService, CredentialsService],
})
export class UsersModule {}
