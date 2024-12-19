import { Controller } from '@nestjs/common';
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
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users.get.all' })
  async getUsers() {
    return this.usersService.getUsers();
  }

  @MessagePattern({ cmd: 'users.get.current' })
  async getCurrentUser(data: { user: User }) {
    return this.usersService.getCurrentUserBasic(data.user);
  }

  @MessagePattern({ cmd: 'users.create.profile' })
  async createProfile(createProfileDto: CreateProfileDto) {
    return this.usersService.createProfile(createProfileDto);
  }

  @MessagePattern({ cmd: 'users.create' })
  async createUser(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'users.get.or.create' })
  async getOrCreateUser(createUserDto: CreateUserDto) {
    return this.usersService.getOrCreateUser(createUserDto);
  }

  @MessagePattern({ cmd: 'users.get.by.email' })
  async getUserByEmail(payload: { email: string }) {
    return this.usersService.getUser(payload);
  }

  @MessagePattern({ cmd: 'users.update' })
  async updateUser(data: { query: TokenPayload; data: ReceivedRefreshToken }) {
    return this.usersService.updateUser(data.query, data.data);
  }
}
