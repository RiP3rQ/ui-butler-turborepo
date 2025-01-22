import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { CredentialsController } from '../credentials/credentials.controller';
import { CredentialsService } from '../credentials/credentials.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController, CredentialsController],
  providers: [UsersService, CredentialsService],
})
export class UsersModule {}
