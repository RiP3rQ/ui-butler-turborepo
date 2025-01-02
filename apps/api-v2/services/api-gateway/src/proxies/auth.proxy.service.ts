// auth.proxy.service.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { AuthProto } from '@app/proto';
import { handleGrpcError } from '../utils/grpc-error.util';
import { AuthServiceClient } from '@app/common';
import { GrpcClientProxy } from './grpc-client.proxy';

@Injectable()
export class AuthProxyService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientGrpc,
    private readonly grpcClient: GrpcClientProxy,
  ) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  async register(
    request: AuthProto.RegisterRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      return await this.grpcClient.call(
        this.authService.register(request),
        'AuthProxyService.register',
      );
    } catch (error) {
      console.error('Error in auth proxy register:', error);
      throw error;
    }
  }

  async login(
    request: AuthProto.LoginRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      console.log('Proxying login request:', { email: request.user.email });
      return await this.grpcClient.call(
        this.authService.login(request),
        'AuthProxyService.login',
      );
    } catch (error) {
      console.error('Error in auth proxy login:', error);
      handleGrpcError(error);
    }
  }

  async refreshToken(
    request: AuthProto.RefreshTokenRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      console.log('Proxying refresh token request:', {
        email: request.user.email,
      });

      const response = await this.grpcClient.call(
        this.authService.refreshToken(request),
        'Auth.refreshToken',
      );

      console.log('Refresh token response received');
      return response;
    } catch (error) {
      console.error('Error in auth proxy refreshToken:', error);
      handleGrpcError(error);
    }
  }

  async verifyRefreshToken(
    request: AuthProto.VerifyRefreshTokenRequest,
  ): Promise<AuthProto.User> {
    try {
      console.log('Proxying verify refresh token request:', {
        email: request.email,
      });
      return await this.grpcClient.call(
        this.authService.verifyRefreshToken(request),
        'AuthProxyService.verifyRefreshToken',
      );
    } catch (error) {
      console.error('Error in auth proxy verifyRefreshToken:', error);
      handleGrpcError(error);
    }
  }

  async googleCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      console.log('Proxying Google callback request:', {
        email: request.user.email,
      });
      return await this.grpcClient.call(
        this.authService.googleCallback(request),
        'AuthProxyService.googleCallback',
      );
    } catch (error) {
      console.error('Error in auth proxy googleCallback:', error);
      handleGrpcError(error);
    }
  }

  async githubCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      console.log('Proxying GitHub callback request:', {
        email: request.user.email,
      });
      return await this.grpcClient.call(
        this.authService.githubCallback(request),
        'AuthProxyService.githubCallback',
      );
    } catch (error) {
      console.error('Error in auth proxy githubCallback:', error);
      handleGrpcError(error);
    }
  }

  async verifyUser(
    request: AuthProto.VerifyUserRequest,
  ): Promise<AuthProto.User> {
    try {
      console.log('Proxying verify user request:', { email: request.email });
      return await this.grpcClient.call(
        this.authService.verifyUser(request),
        'AuthProxyService.verifyUser',
      );
    } catch (error) {
      console.error('Error in auth proxy verifyUser:', error);
      handleGrpcError(error);
    }
  }
}
