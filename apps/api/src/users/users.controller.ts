import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest } from './dto/create-user.request';
import { CreateProfileRequest } from './dto/create-profile.request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from './types/user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers(@CurrentUser() user: User) {
    console.log(user);
    return this.usersService.getUsers();
  }

  @Get('current-basic')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.getCurrentUserBasic(user);
  }

  @Post('profile')
  async createProfile(@Body() request: CreateProfileRequest) {
    return this.usersService.createProfile(request);
  }

  @Post()
  async createUser(@Body() request: CreateUserRequest) {
    return this.usersService.createUser(request);
  }
}
