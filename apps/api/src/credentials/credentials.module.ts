import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CredentialsController],
  providers: [CredentialsService, JwtAuthGuard],
})
export class CredentialsModule {}
