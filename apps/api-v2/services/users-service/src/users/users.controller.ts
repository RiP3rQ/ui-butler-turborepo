import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UsersProto } from '@app/proto';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'GetUsers')
  async getUsers(
    request: UsersProto.Empty,
  ): Promise<UsersProto.GetUsersResponse> {
    this.logger.debug('Getting all users');
    const users = await this.usersService.getUsers();
    return {
      $type: 'api.users.GetUsersResponse',
      users: users.map((user) => ({ ...user, $type: 'api.users.User' })),
    };
  }

  @GrpcMethod('UsersService', 'GetCurrentUser')
  async getCurrentUser(
    request: UsersProto.GetCurrentUserRequest,
  ): Promise<UsersProto.GetCurrentUserResponse> {
    this.logger.debug(`Getting current user for: ${request.user.email}`);
    const userData = await this.usersService.getCurrentUserBasic(request.user);
    return {
      $type: 'api.users.GetCurrentUserResponse',
      ...userData,
    };
  }

  @GrpcMethod('UsersService', 'CreateProfile')
  async createProfile(
    request: UsersProto.CreateProfileDto,
  ): Promise<UsersProto.Profile> {
    this.logger.debug('Creating profile');
    const profile = await this.usersService.createProfile(request);
    return {
      id: profile.id,
      ...request,
      $type: 'api.users.Profile',
    };
  }

  @GrpcMethod('UsersService', 'CreateUser')
  async createUser(
    request: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    this.logger.debug(`Creating user with email: ${request.email}`);
    const user = await this.usersService.createUser(request);
    return {
      ...user,
      $type: 'api.users.User',
    };
  }

  @GrpcMethod('UsersService', 'GetOrCreateUser')
  async getOrCreateUser(
    request: UsersProto.CreateUserDto,
  ): Promise<UsersProto.User> {
    this.logger.debug(`Getting or creating user with email: ${request.email}`);
    const user = await this.usersService.getOrCreateUser(request);
    return {
      ...user,
      $type: 'api.users.User',
    };
  }

  @GrpcMethod('UsersService', 'GetUserByEmail')
  async getUserByEmail(
    request: UsersProto.GetUserByEmailRequest,
  ): Promise<UsersProto.User> {
    this.logger.debug(`Getting user by email: ${request.email}`);
    const user = await this.usersService.getUser({ email: request.email });
    return {
      ...user,
      $type: 'api.users.User',
    };
  }

  @GrpcMethod('UsersService', 'UpdateUser')
  async updateUser(
    request: UsersProto.UpdateUserRequest,
  ): Promise<UsersProto.User> {
    this.logger.debug(`Updating user: ${request.query.email}`);
    const [updatedUser] = await this.usersService.updateUser(
      request.query,
      request.data,
    );
    return {
      ...updatedUser,
      $type: 'api.users.User',
    };
  }
}
