// auth.service.ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthProto, Timestamp, UsersProto } from '@app/proto';

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
    return {
      $type: 'api.auth.TokenPayload',
      userId: user.id.toString(),
      email: user.email,
    };
  }

  private convertToUsersTokenPayload(
    tokenPayload: AuthProto.TokenPayload,
  ): UsersProto.TokenPayload {
    return {
      $type: 'api.users.TokenPayload',
      userId: tokenPayload.userId,
      email: tokenPayload.email,
    };
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
      expiresAccessToken: this.dateToTimestamp(expiresAccessToken),
      expiresRefreshToken: this.dateToTimestamp(expiresRefreshToken),
    };
  }

  async login(
    user: AuthProto.User,
    redirect = false,
  ): Promise<AuthProto.AuthResponse> {
    const tokenPayload = this.createTokenPayload(user);
    const { accessToken, refreshToken } =
      await this.generateTokens(tokenPayload);
    const { expiresAccessToken, expiresRefreshToken } =
      this.getTokenExpirations();

    const refreshTokenData = await hash(refreshToken, 10);

    const updateRequest: UsersProto.UpdateUserRequest = {
      $type: 'api.users.UpdateUserRequest',
      query: this.convertToUsersTokenPayload(tokenPayload),
      data: {
        $type: 'api.users.ReceivedRefreshToken',
        refreshToken: refreshTokenData,
      },
    };

    await firstValueFrom(this.usersService.updateUser(updateRequest));

    const response: AuthProto.AuthResponse = {
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

    return response;
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
        expiresAccessToken,
        expiresRefreshToken,
      };
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('User registration failed');
    }
  }

  async verifyUser(email: string, password: string): Promise<AuthProto.User> {
    try {
      const request: UsersProto.GetUserByEmailRequest = {
        $type: 'api.users.GetUserByEmailRequest',
        email,
      };

      const user = await firstValueFrom(
        this.usersService.getUserByEmail(request),
      );

      const authenticated = await compare(password, user?.password ?? '');
      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return {
        ...user,
        $type: 'api.auth.User',
      };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Credentials are not valid.');
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
