import { Module } from '@nestjs/common';
import { DatabaseModule, users } from '@app/database';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { CredentialsController } from '../credentials/credentials.controller';
import { CredentialsService } from '../credentials/credentials.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule.forRoot({
      DATABASE_URL: process.env.DATABASE_URL!,
    }),
    DatabaseModule.forFeature(users),
  ],
  controllers: [UsersController, CredentialsController],
  providers: [UsersService, CredentialsService],
})
export class UsersModule {}
