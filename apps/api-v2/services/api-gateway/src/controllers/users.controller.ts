import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../../../../src/users/dto/create-user.dto';
import { type User } from '../../../../src/database/schemas/users';
import { CurrentUser } from '../../../../src/auth/current-user.decorator';
import { JwtAuthGuard } from '../../../../src/auth/guards/jwt-auth.guard';
import { CreateProfileDto } from '../../../../src/users/dto/create-profile.dto';

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
