// auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { type ClientGrpc, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthProto, Timestamp, UsersProto } from '@app/proto';
import { GrpcError } from '@app/common';
import { status } from '@grpc/grpc-js';

@Injectable()
export class AuthService {
  private usersService: UsersProto.UsersServiceClient;

  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientGrpc,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.usersService =
      this.usersClient.getService<UsersProto.UsersServiceClient>(
        'UsersService',
      );
  }

  private dateToTimestamp(date: Date): Timestamp {
    return {
      $type: 'google.protobuf.Timestamp',
      seconds: Math.floor(date.getTime() / 1000),
      nanos: (date.getTime() % 1000) * 1000000,
    };
  }

  private createTokenPayload(user: AuthProto.User): AuthProto.TokenPayload {
    console.log('Creating token payload for user:', { email: user.email });
    return {
      $type: 'api.auth.TokenPayload',
      userId: user.id.toString(),
      email: user.email,
    };
  }

  private async updateUserRefreshToken(
    tokenPayload: AuthProto.TokenPayload,
    refreshTokenHash: string,
  ) {
    const updateRequest: UsersProto.UpdateUserRequest = {
      $type: 'api.users.UpdateUserRequest',
      query: {
        $type: 'api.users.TokenPayload',
        userId: tokenPayload.userId,
        email: tokenPayload.email,
      },
      data: {
        $type: 'api.users.ReceivedRefreshToken',
        refreshToken: refreshTokenHash,
      },
    };

    // Use firstValueFrom here as well
    await firstValueFrom(this.usersService.updateUser(updateRequest));
  }

  private async generateTokens(payload: AuthProto.TokenPayload) {
    const accessTokenExpiration = parseInt(
      this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
    );
    const refreshTokenExpiration = parseInt(
      this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
    );

    const accessTokenOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: Math.floor(accessTokenExpiration / 1000),
    };

    const refreshTokenOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: Math.floor(refreshTokenExpiration / 1000),
    };

    const accessToken = this.jwtService.sign(payload, accessTokenOptions);
    const refreshToken = this.jwtService.sign(payload, refreshTokenOptions);

    return { accessToken, refreshToken };
  }

  private getTokenExpirations() {
    const expiresAccessToken = new Date();
    const expiresRefreshToken = new Date();

    expiresAccessToken.setTime(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
        ),
    );

    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
        ),
    );

    return {
      expiresAccessToken: {
        $type: 'google.protobuf.Timestamp' as const,
        seconds: Math.floor(expiresAccessToken.getTime() / 1000),
        nanos: (expiresAccessToken.getTime() % 1000) * 1000000,
      },
      expiresRefreshToken: {
        $type: 'google.protobuf.Timestamp' as const,
        seconds: Math.floor(expiresRefreshToken.getTime() / 1000),
        nanos: (expiresRefreshToken.getTime() % 1000) * 1000000,
      },
    };
  }

  async register(
    userData: AuthProto.CreateUserDto,
  ): Promise<AuthProto.AuthResponse> {
    try {
      const createUserRequest: UsersProto.CreateUserDto = {
        ...userData,
        $type: 'api.users.CreateUserDto',
      };

      const newUser = await firstValueFrom(
        this.usersService.createUser(createUserRequest),
      );

      if (!newUser) {
        throw new Error('User creation failed');
      }

      const tokenPayload = this.createTokenPayload({
        ...newUser,
        $type: 'api.auth.User',
      });

      const { accessToken, refreshToken } =
        await this.generateTokens(tokenPayload);
      const { expiresAccessToken, expiresRefreshToken } =
        this.getTokenExpirations();

      return {
        $type: 'api.auth.AuthResponse',
        accessToken,
        refreshToken,
        expiresAccessToken: {
          $type: 'google.protobuf.Timestamp' as const,
          seconds: expiresAccessToken.seconds,
          nanos: expiresAccessToken.nanos,
        },
        expiresRefreshToken: {
          $type: 'google.protobuf.Timestamp' as const,
          seconds: expiresRefreshToken.seconds,
          nanos: expiresRefreshToken.nanos,
        },
      };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('User registration failed');
    }
  }

  async login(
    user: AuthProto.User,
    redirect = false,
  ): Promise<AuthProto.AuthResponse> {
    try {
      if (!user || !user.id || !user.email) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid user data provided',
        });
      }

      const tokenPayload: AuthProto.TokenPayload = {
        $type: 'api.auth.TokenPayload',
        userId: user.id.toString(),
        email: user.email,
      };

      const { accessToken, refreshToken } =
        await this.generateTokens(tokenPayload);
      const { expiresAccessToken, expiresRefreshToken } =
        this.getTokenExpirations();

      const refreshTokenData = await hash(refreshToken, 10);
      await this.updateUserRefreshToken(tokenPayload, refreshTokenData);

      return {
        $type: 'api.auth.AuthResponse',
        accessToken,
        refreshToken,
        expiresAccessToken,
        expiresRefreshToken,
        redirect: redirect || undefined,
        redirectUrl: redirect
          ? this.configService.getOrThrow('AUTH_UI_REDIRECT')
          : undefined,
      };
    } catch (error) {
      const err = error as GrpcError;
      console.error('Error in login:', {
        err,
        user,
        stack: err.stack,
      });

      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        message: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async refreshToken(user: AuthProto.User): Promise<AuthProto.AuthResponse> {
    try {
      if (!user || !user.id || !user.email) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Invalid user data provided for refresh token',
        });
      }

      console.log('Refreshing token for user:', {
        email: user.email,
        id: user.id,
      });

      const tokenPayload: AuthProto.TokenPayload = {
        $type: 'api.auth.TokenPayload',
        userId: user.id.toString(),
        email: user.email,
      };

      const { accessToken, refreshToken } =
        await this.generateTokens(tokenPayload);
      const { expiresAccessToken, expiresRefreshToken } =
        this.getTokenExpirations();

      const refreshTokenData = await hash(refreshToken, 10);
      await this.updateUserRefreshToken(tokenPayload, refreshTokenData);

      return {
        $type: 'api.auth.AuthResponse',
        accessToken,
        refreshToken,
        expiresAccessToken,
        expiresRefreshToken,
      };
    } catch (error) {
      const err = error as GrpcError;
      console.error('Error in refreshToken:', {
        err,
        user,
        stack: err.stack,
      });

      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        message: 'Token refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async verifyUser(email: string, password: string): Promise<AuthProto.User> {
    try {
      console.log('Verifying user:', { email });

      const getUserRequest: UsersProto.GetUserByEmailRequest = {
        $type: 'api.users.GetUserByEmailRequest',
        email,
      };

      // Use firstValueFrom to convert Observable to Promise
      const user = await firstValueFrom(
        this.usersService.getUserByEmail(getUserRequest),
      );

      if (!user) {
        console.log('User not found:', { email });
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }

      const authenticated = await compare(password, user?.password ?? '');

      if (!authenticated) {
        console.log('Invalid password for user:', { email });
        throw new RpcException({
          code: status.UNAUTHENTICATED,
          message: 'Invalid credentials',
        });
      }

      return {
        $type: 'api.auth.User',
        id: user.id,
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      const grpcError = error as GrpcError;
      console.error('Error in verifyUser:', {
        code: grpcError.code,
        message: grpcError.message,
        details: grpcError.details,
        stack: grpcError.stack,
      });

      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
        details: grpcError.message || 'Unknown error',
      });
    }
  }

  async verifyUserRefreshToken(
    refreshToken: string,
    email: string,
  ): Promise<AuthProto.User> {
    try {
      const request: UsersProto.GetUserByEmailRequest = {
        $type: 'api.users.GetUserByEmailRequest',
        email,
      };

      const user = await firstValueFrom(
        this.usersService.getUserByEmail(request),
      );

      if (!user?.refreshToken || !refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const authenticated = await compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return {
        ...user,
        $type: 'api.auth.User',
      };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
