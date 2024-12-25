// users.controller.ts
import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { CurrentUser, JwtAuthGuard } from '@app/common';
import { UsersProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';

@Controller('users')
export class UsersController implements OnModuleInit {
  private usersService: UsersProto.UsersServiceClient;

  constructor(@Inject('USERS_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<UsersProto.UsersServiceClient>('UsersService');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    try {
      const request: UsersProto.Empty = { $type: 'api.users.Empty' };
      return this.usersService.getUsers(request);
    } catch (e) {
      handleGrpcError(e);
    }
  }

  @Get('current-basic')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: UsersProto.User) {
    try {
      const request: UsersProto.GetCurrentUserRequest = {
        $type: 'api.users.GetCurrentUserRequest',
        user: {
          ...user,
          $type: 'api.users.User',
        },
      };
      return this.usersService.getCurrentUser(request);
    } catch (e) {
      handleGrpcError(e);
    }
  }

  @Post('profile')
  async createProfile(@Body() createProfileDto: UsersProto.CreateProfileDto) {
    try {
      const request: UsersProto.CreateProfileDto = {
        $type: 'api.users.CreateProfileDto',
        ...createProfileDto,
      };
      return this.usersService.createProfile(request);
    } catch (e) {
      handleGrpcError(e);
    }
  }

  @Post()
  async createUser(@Body() createUserDto: UsersProto.CreateUserDto) {
    try {
      const request: UsersProto.CreateUserDto = {
        $type: 'api.users.CreateUserDto',
        ...createUserDto,
      };
      return this.usersService.createUser(request);
    } catch (e) {
      handleGrpcError(e);
    }
  }
}
