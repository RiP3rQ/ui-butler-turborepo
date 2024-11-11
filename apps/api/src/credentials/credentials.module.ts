import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';

@Module({
  controllers: [CredentialsController],
  providers: [CredentialsService],
})
export class CredentialsModule {}
