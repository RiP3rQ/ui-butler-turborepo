// auth.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthProto } from '@app/proto';
import { status } from '@grpc/grpc-js';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  async register(
    request: AuthProto.RegisterRequest,
  ): Promise<AuthProto.AuthResponse> {
    return this.authService.register(request.user);
  }

  @GrpcMethod('AuthService', 'Login')
  async login(
    request: AuthProto.LoginRequest,
  ): Promise<AuthProto.AuthResponse> {
    if (!request?.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User data is required',
      });
    }

    return this.authService.login(request.user);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(
    request: AuthProto.RefreshTokenRequest,
  ): Promise<AuthProto.AuthResponse> {
    console.log('Refresh token request received:', request);

    if (!request?.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User data is required',
      });
    }

    return this.authService.login(request.user);
  }

  // TODO: FIX GITHUB LOGIN FUNCTIONALITY
  @GrpcMethod('AuthService', 'GoogleCallback')
  async googleCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    return this.authService.login(request.user, true);
  }

  // TODO: FIX GITHUB LOGIN FUNCTIONALITY
  @GrpcMethod('AuthService', 'GithubCallback')
  async githubCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    return this.authService.login(request.user, true);
  }

  @GrpcMethod('AuthService', 'VerifyRefreshToken')
  async verifyRefreshToken(
    request: AuthProto.VerifyRefreshTokenRequest,
  ): Promise<AuthProto.User> {
    return this.authService.verifyUserRefreshToken(
      request.refreshToken,
      request.email,
    );
  }

  @GrpcMethod('AuthService', 'VerifyUser')
  async verifyUser(
    request: AuthProto.VerifyUserRequest,
  ): Promise<AuthProto.User> {
    try {
      return await this.authService.verifyUser(request.email, request.password);
    } catch (error) {
      console.error('User verification failed:', error);
      return null;
    }
  }
}
