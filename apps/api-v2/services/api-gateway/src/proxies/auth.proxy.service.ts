// auth.proxy.service.ts
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { AuthProto } from '@app/proto';
import { GRPC_TO_HTTP_STATUS } from '../constants/grpc-error.constants';

interface AuthServiceClient {
  login(request: AuthProto.LoginRequest): Promise<AuthProto.AuthResponse>;

  register(request: AuthProto.RegisterRequest): Promise<AuthProto.AuthResponse>;

  refreshToken(
    request: AuthProto.RefreshTokenRequest,
  ): Promise<AuthProto.AuthResponse>;

  googleCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse>;

  githubCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse>;

  verifyRefreshToken(
    request: AuthProto.VerifyRefreshTokenRequest,
  ): Promise<AuthProto.User>;

  verifyUser(request: AuthProto.VerifyUserRequest): Promise<AuthProto.User>;
}

@Injectable()
export class AuthProxyService implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject('AUTH_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>('AuthService');
  }

  async login(
    request: AuthProto.LoginRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      return await this.authService.login(request);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async register(
    request: AuthProto.RegisterRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      return await this.authService.register(request);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async refreshToken(
    request: AuthProto.RefreshTokenRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      return await this.authService.refreshToken(request);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async googleCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      return await this.authService.googleCallback(request);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async githubCallback(
    request: AuthProto.SocialCallbackRequest,
  ): Promise<AuthProto.AuthResponse> {
    try {
      return await this.authService.githubCallback(request);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async verifyRefreshToken(
    request: AuthProto.VerifyRefreshTokenRequest,
  ): Promise<AuthProto.User> {
    try {
      return await this.authService.verifyRefreshToken(request);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async verifyUser(
    request: AuthProto.VerifyUserRequest,
  ): Promise<AuthProto.User> {
    try {
      return await this.authService.verifyUser(request);
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private handleGrpcError(error: any): never {
    const status =
      GRPC_TO_HTTP_STATUS[error.code] || HttpStatus.INTERNAL_SERVER_ERROR;

    // Log the error
    console.error('gRPC Auth Service Error:', {
      code: error.code,
      status,
      message: error.message,
      details: error.details,
      metadata: error.metadata,
      stack: error.stack,
    });

    // Create an appropriate HTTP exception
    throw new HttpException(
      {
        status,
        error: error.message,
        details: error.details,
      },
      status,
    );
  }
}
