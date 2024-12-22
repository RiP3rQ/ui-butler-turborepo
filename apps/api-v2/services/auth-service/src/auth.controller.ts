import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthResponse,
  AuthServiceController,
  AuthServiceControllerMethods,
  LoginRequest,
  RegisterRequest,
  User,
  VerifyRefreshTokenRequest,
  VerifyUserRequest,
} from '@app/proto';

@Controller()
@AuthServiceControllerMethods() // This decorator adds gRPC method metadata
export class AuthController implements AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  async login(request: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(request.user);
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(request);
  }

  async refreshToken(request: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(request.user);
  }

  async googleCallback(request: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(request.user, true);
  }

  async githubCallback(request: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(request.user, true);
  }

  async verifyRefreshToken(request: VerifyRefreshTokenRequest): Promise<User> {
    return this.authService.verifyUserRefreshToken(
      request.refreshToken,
      request.email,
    );
  }

  async verifyUser(request: VerifyUserRequest): Promise<User> {
    try {
      return await this.authService.verifyUser(request.email, request.password);
    } catch (error) {
      console.error('User verification failed:', error);
      return null;
    }
  }
}
