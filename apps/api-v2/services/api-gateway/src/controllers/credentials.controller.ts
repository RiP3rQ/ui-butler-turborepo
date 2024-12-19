import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateCredentialDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@app/common';

@Controller('credentials')
@UseGuards(JwtAuthGuard)
export class CredentialsController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Get()
  async getUserCredentials(@CurrentUser() user: User) {
    return firstValueFrom(this.usersClient.send('credentials.get', { user }));
  }

  @Post()
  async createCredential(
    @CurrentUser() user: User,
    @Body() createCredentialDto: CreateCredentialDto,
  ) {
    return firstValueFrom(
      this.usersClient.send('credentials.create', {
        user,
        createCredentialDto,
      }),
    );
  }

  @Delete()
  async deleteCredential(@CurrentUser() user: User, @Query('id') id: string) {
    return firstValueFrom(
      this.usersClient.send('credentials.delete', { user, id: Number(id) }),
    );
  }
}
