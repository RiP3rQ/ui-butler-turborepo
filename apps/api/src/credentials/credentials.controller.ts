import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { LogErrors } from '../common/error-handling/log-errors.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../database/schemas/users';
import { CreateCredentialDto } from './dto/create-credential.dto';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  // GET /credentials
  @Get()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  getUserCredentials(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.credentialsService.getUserCredentials(user);
  }

  // POST /credentials
  @Post()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  createCredential(
    @CurrentUser() user: User,
    @Body() createCredentialDto: CreateCredentialDto,
  ) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.credentialsService.createCredential(user, createCredentialDto);
  }

  // DELETE /credentials?id=${id}
  @Delete()
  @LogErrors()
  @UseGuards(JwtAuthGuard)
  deleteCredential(@CurrentUser() user: User, @Query('id') id: string) {
    if (!user) {
      throw new NotFoundException('Unauthorized');
    }
    return this.credentialsService.deleteCredential(user, Number(id));
  }
}
