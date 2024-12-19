import { Controller, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  CreateProfileDto,
  CreateUserDto,
  ReceivedRefreshToken,
  TokenPayload,
  User,
} from '@app/common';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.get.all')
  async getUsers() {
    this.logger.debug('Getting all users');
    return this.usersService.getUsers();
  }

  @MessagePattern('users.get.current')
  async getCurrentUser(data: { user: User }) {
    this.logger.debug(`Getting current user for: ${data.user.email}`);
    return this.usersService.getCurrentUserBasic(data.user);
  }

  @MessagePattern('users.create.profile')
  async createProfile(createProfileDto: CreateProfileDto) {
    this.logger.debug('Creating profile');
    return this.usersService.createProfile(createProfileDto);
  }

  @MessagePattern('users.create')
  async createUser(createUserDto: CreateUserDto) {
    this.logger.debug(`Creating user with email: ${createUserDto.email}`);
    return this.usersService.createUser(createUserDto);
  }

  @MessagePattern('users.get.or.create')
  async getOrCreateUser(createUserDto: CreateUserDto) {
    this.logger.debug(
      `Getting or creating user with email: ${createUserDto.email}`,
    );
    return this.usersService.getOrCreateUser(createUserDto);
  }

  @MessagePattern('users.get.by.email')
  async getUserByEmail(payload: { email: string }) {
    this.logger.debug(`Getting user by email: ${payload.email}`);
    return this.usersService.getUser(payload);
  }

  @MessagePattern('users.update')
  async updateUser(data: { query: TokenPayload; data: ReceivedRefreshToken }) {
    this.logger.debug(`Updating user: ${data.query.email}`);
    return this.usersService.updateUser(data.query, data.data);
  }
}
