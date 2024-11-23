import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import type { User } from '../database/schemas/users';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUsers() {
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
  async createProfile(@Body() request: CreateProfileDto) {
    return this.usersService.createProfile(request);
  }

  @Post()
  async createUser(@Body() request: CreateUserDto) {
    return this.usersService.createUser(request);
  }
}
