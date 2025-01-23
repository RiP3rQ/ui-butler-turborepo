import { status } from '@grpc/grpc-js';
import { UsersProto } from '@microservices/proto';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'GetUsers')
  public async getUsers(): Promise<UsersProto.GetUsersResponse> {
    this.logger.debug('Getting all users');
    return await this.usersService.getUsers();
  }

  @GrpcMethod('UsersService', 'GetCurrentUser')
  public async getCurrentUser(
    request: UsersProto.GetCurrentUserRequest,
  ): Promise<UsersProto.GetCurrentUserResponse> {
    if (!request.user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }
    this.logger.debug(`Getting current user for: ${request.user.email}`);
    return await this.usersService.getCurrentUserBasic(request.user);
  }

  @GrpcMethod('UsersService', 'CreateProfile')
  public async createProfile(
    request: UsersProto.CreateProfileDto,
  ): Promise<UsersProto.Profile> {
    this.logger.debug('Creating profile');
    return await this.usersService.createProfile(request);
  }

  @GrpcMethod('UsersService', 'CreateUser')
  public async createUser(
    request: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    this.logger.debug(`Creating user with email: ${request.email}`);
    return await this.usersService.createUser(request);
  }

  @GrpcMethod('UsersService', 'GetOrCreateUser')
  public async getOrCreateUser(
    request: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    this.logger.debug(`Getting or creating user with email: ${request.email}`);
    return await this.usersService.getOrCreateUser(request);
  }

  @GrpcMethod('UsersService', 'GetUserByEmail')
  public async getUserByEmail(
    request: UsersProto.GetUserByEmailRequest,
  ): Promise<UsersProto.User> {
    this.logger.debug(`Getting user by email: ${request.email}`);
    return await this.usersService.getUser({ email: request.email });
  }

  @GrpcMethod('UsersService', 'UpdateUser')
  public async updateUser(
    request: UsersProto.UpdateUserRequest,
  ): Promise<UsersProto.User> {
    if (!request.query) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found',
      });
    }

    this.logger.debug(`Updating user: ${request.query.email}`);
    return await this.usersService.updateUser(request);
  }
}
