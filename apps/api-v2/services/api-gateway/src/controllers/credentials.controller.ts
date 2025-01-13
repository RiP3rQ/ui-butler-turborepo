import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  CreateCredentialDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@app/common';
import { UsersProto } from '@app/proto';
import { GrpcClientProxy } from '../proxies/grpc-client.proxy';

@Controller('credentials')
@UseGuards(JwtAuthGuard)
export class CredentialsController implements OnModuleInit {
  private usersService: UsersProto.UsersServiceClient;

  constructor(
    @Inject('USERS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<UsersProto.UsersServiceClient>('UsersService');
  }

  @Get()
  async getUserCredentials(@CurrentUser() user: User) {
    const request: UsersProto.GetCredentialsRequest = {
      $type: 'api.users.GetCredentialsRequest',
      user: {
        $type: 'api.users.User',
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };

    const response = await this.grpcClient.call(
      this.usersService.getUserCredentials(request),
      'Credentials.getUserCredentials',
    );

    return response.credentials;
  }

  @Post()
  async createCredential(
    @CurrentUser() user: User,
    @Body() createCredentialDto: CreateCredentialDto,
  ) {
    const request: UsersProto.CreateCredentialRequest = {
      $type: 'api.users.CreateCredentialRequest',
      user: {
        $type: 'api.users.User',
        id: user.id,
        email: user.email,
        username: user.username,
      },
      credential: {
        $type: 'api.users.CreateCredentialDto',
        ...createCredentialDto,
      },
    };

    return await this.grpcClient.call(
      this.usersService.createCredential(request),
      'Credentials.createCredential',
    );
  }

  @Delete()
  async deleteCredential(@CurrentUser() user: User, @Query('id') id: string) {
    const request: UsersProto.DeleteCredentialRequest = {
      $type: 'api.users.DeleteCredentialRequest',
      user: {
        $type: 'api.users.User',
        id: user.id,
        email: user.email,
        username: user.username,
      },
      id: Number(id),
    };

    return await this.grpcClient.call(
      this.usersService.deleteCredential(request),
      'Credentials.deleteCredential',
    );
  }
}
