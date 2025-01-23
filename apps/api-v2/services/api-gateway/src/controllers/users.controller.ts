import { CurrentUser, JwtAuthGuard } from '@app/common';
import { UsersProto } from '@microservices/proto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { GrpcClientProxy } from 'src/proxies/grpc-client.proxy';
import { handleGrpcError } from '../utils/grpc-error.util';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController implements OnModuleInit {
  private usersService: UsersProto.UsersServiceClient;

  constructor(
    @Inject('USERS_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  public onModuleInit(): void {
    this.usersService =
      this.client.getService<UsersProto.UsersServiceClient>('UsersService');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @CacheKey('users:all')
  @CacheTTL(30000) // Cache expiration time in milliseconds
  public async getUsers(): Promise<UsersProto.GetUsersResponse> {
    try {
      const request: UsersProto.Empty = { $type: 'api.users.Empty' };

      const response = await this.grpcClient.call<UsersProto.GetUsersResponse>(
        this.usersService.getUsers(request),
        'Users.getUsers',
      );

      return response;
    } catch (e) {
      handleGrpcError(e);
    }
  }

  @Get('current-basic')
  @CacheKey('users:detail')
  @CacheTTL(60000) // Cache expiration time in milliseconds
  @UseGuards(JwtAuthGuard)
  public async getCurrentUser(
    @CurrentUser() user: UsersProto.User,
  ): Promise<UsersProto.GetCurrentUserResponse> {
    try {
      const request: UsersProto.GetCurrentUserRequest = {
        $type: 'api.users.GetCurrentUserRequest',
        user: {
          ...user,
          $type: 'api.users.User',
        },
      };

      const response =
        await this.grpcClient.call<UsersProto.GetCurrentUserResponse>(
          this.usersService.getCurrentUser(request),
          'Users.getCurrentUser',
        );

      return response;
    } catch (e) {
      handleGrpcError(e);
    }
  }

  @Post('profile')
  public async createProfile(
    @Body() createProfileDto: UsersProto.CreateProfileDto,
  ): Promise<UsersProto.Profile> {
    try {
      const request: UsersProto.CreateProfileDto = {
        ...createProfileDto,
      };

      const response = await this.grpcClient.call<UsersProto.Profile>(
        this.usersService.createProfile(request),
        'Users.createProfile',
      );

      return response;
    } catch (e) {
      handleGrpcError(e);
    }
  }

  @Post()
  public async createUser(
    @Body() createUserDto: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    try {
      const request: UsersProto.CreateUserDto = {
        ...createUserDto,
        $type: 'api.users.CreateUserDto',
      };

      const response = await this.grpcClient.call<UsersProto.User>(
        this.usersService.createUser(request),
        'Users.createUser',
      );

      return response;
    } catch (e) {
      handleGrpcError(e);
    }
  }
}
