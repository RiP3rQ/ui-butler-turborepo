// auth.controller.ts
import { status } from '@grpc/grpc-js';
import { AuthProto } from '@microservices/proto';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Register')
  public async register(
    request: AuthProto.RegisterRequest,
  ): Promise<AuthProto.AuthResponse> {
    this.logger.log('Register request received:', request);

    if (!request.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User data is required',
      });
    }

    return this.authService.register(request.user);
  }

  @GrpcMethod('AuthService', 'Login')
  public async login(
    request: AuthProto.LoginRequest,
  ): Promise<AuthProto.AuthResponse> {
    this.logger.log('Login request received:', request);
    if (!request.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User data is required',
      });
    }

    return this.authService.login(request.user);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  public async refreshToken(
    request: AuthProto.RefreshTokenRequest,
  ): Promise<AuthProto.AuthResponse> {
    this.logger.log('Refresh token request received:', request);

    if (!request.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User data is required',
      });
    }

    return this.authService.login(request.user);
  }

  @GrpcMethod('AuthService', 'GoogleCallback')
  public async googleCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    this.logger.log('Google callback request received:', request);

    if (!request.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User data is required',
      });
    }

    return this.authService.login(request.user, true);
  }

  @GrpcMethod('AuthService', 'GithubCallback')
  public async githubCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    this.logger.log('Github callback request received:', request);

    if (!request.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'User data is required',
      });
    }

    return this.authService.login(request.user, true);
  }

  @GrpcMethod('AuthService', 'VerifyRefreshToken')
  public async verifyRefreshToken(
    request: AuthProto.VerifyRefreshTokenRequest,
  ): Promise<AuthProto.User> {
    this.logger.log('Verify refresh token request received:', request);

    if (!request.refreshToken || !request.email) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Refresh token and email are required',
      });
    }

    return this.authService.verifyUserRefreshToken(
      request.refreshToken,
      request.email,
    );
  }

  @GrpcMethod('AuthService', 'VerifyUser')
  public async verifyUser(
    request: AuthProto.VerifyUserRequest,
  ): Promise<AuthProto.User> {
    this.logger.log('Verify user request received:', request);

    if (!request.email || !request.password) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Email and password are required',
      });
    }

    return this.authService.verifyUser(request.email, request.password);
  }
}
