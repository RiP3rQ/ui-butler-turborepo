import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateProfileDto,
  CreateUserDto,
  CurrentUser,
  JwtAuthGuard,
  type User,
} from '@app/common';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    return firstValueFrom(this.usersClient.send({ cmd: 'users.get.all' }, {}));
  }

  @Get('current-basic')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'users.get.current' }, { user }),
    );
  }

  @Post('profile')
  async createProfile(@Body() createProfileDto: CreateProfileDto) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'users.create.profile' }, createProfileDto),
    );
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return firstValueFrom(
      this.usersClient.send({ cmd: 'users.create' }, createUserDto),
    );
  }
}
