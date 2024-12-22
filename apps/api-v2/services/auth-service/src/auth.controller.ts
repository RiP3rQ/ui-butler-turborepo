import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto, User } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(@Payload() data: { user: User }) {
    return this.authService.login(data.user);
  }

  @MessagePattern('auth.register')
  async register(@Payload() data: { user: CreateUserDto }) {
    return this.authService.register(data.user);
  }

  @MessagePattern('auth.refresh')
  async refreshToken(@Payload() data: { user: User }) {
    return this.authService.login(data.user);
  }

  @MessagePattern('auth.google.callback')
  async googleCallback(@Payload() data: { user: User }) {
    return this.authService.login(data.user, true);
  }

  @MessagePattern('auth.github.callback')
  async githubCallback(@Payload() data: { user: User }) {
    return this.authService.login(data.user, true);
  }

  @MessagePattern('auth.verify-refresh-token')
  async verifyRefreshToken(data: { refreshToken: string; email: string }) {
    return this.authService.verifyUserRefreshToken(
      data.refreshToken,
      data.email,
    );
  }

  @MessagePattern('auth.verify-user')
  async verifyUser(data: { email: string; password: string }) {
    try {
      return await this.authService.verifyUser(data.email, data.password);
    } catch (error) {
      // Log the error but don't expose internal details
      console.error('User verification failed:', error);
      return null;
    }
  }
}
