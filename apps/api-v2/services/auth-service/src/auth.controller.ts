import { Controller } from '@nestjs/common';
import { UsersService } from '../../../src/users/users.service';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { User } from '../../../src/database/schemas/users';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern({ cmd: 'auth.login' })
  async login(credentials: any) {
    const user = await this.authService.verifyUser(
      credentials.email,
      credentials.password,
    );
    return this.authService.generateAuthResponse(user);
  }

  @MessagePattern({ cmd: 'auth.register' })
  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return this.authService.generateAuthResponse(user);
  }

  @MessagePattern({ cmd: 'auth.google.callback' })
  async googleCallback(data: { user: User }) {
    return this.authService.generateAuthResponse(data.user);
  }
}
