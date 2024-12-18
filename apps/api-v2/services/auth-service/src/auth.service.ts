import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { CreateUserDto, TokenPayload, User } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateTokens(payload: TokenPayload) {
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
    expiresAccessToken.setTime(
      expiresAccessToken.getTime() +
        parseInt(
          this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
        ),
    );

    const expiresRefreshToken = new Date();
    expiresRefreshToken.setTime(
      expiresRefreshToken.getTime() +
        parseInt(
          this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
        ),
    );

    return { expiresAccessToken, expiresRefreshToken };
  }

  async login(user: User, redirect = false) {
    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
      email: user.email ?? '',
    };

    const { accessToken, refreshToken } =
      await this.generateTokens(tokenPayload);
    const { expiresAccessToken, expiresRefreshToken } =
      this.getTokenExpirations();

    const refreshTokenData = await hash(refreshToken, 10);

    // Instead of direct UsersService call, use the microservice
    await firstValueFrom(
      this.usersClient.send('users.update', {
        query: tokenPayload,
        data: { refreshToken: refreshTokenData },
      }),
    );

    const response = {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    };

    if (redirect) {
      return {
        ...response,
        redirect: true,
        redirectUrl: this.configService.getOrThrow('AUTH_UI_REDIRECT'),
      };
    }

    return response;
  }

  async register(userData: CreateUserDto) {
    // Use Users microservice to create user
    const newUser = await firstValueFrom(
      this.usersClient.send('users.create', userData),
    );

    const tokenPayload: TokenPayload = {
      userId: newUser?.id.toString() ?? '',
      email: userData.email,
    };

    const { accessToken, refreshToken } =
      await this.generateTokens(tokenPayload);
    const { expiresAccessToken, expiresRefreshToken } =
      this.getTokenExpirations();

    return {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    };
  }

  async verifyUser(email: string, password: string) {
    try {
      // Use Users microservice to get user
      const user = await firstValueFrom(
        this.usersClient.send('users.get.by.email', { email }),
      );
      const authenticated = await compare(password, user?.password ?? '');
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, email: string) {
    try {
      // Use Users microservice to get user
      const user = await firstValueFrom(
        this.usersClient.send('users.get.by.email', { email }),
      );

      if (!user?.refreshToken || !refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const authenticated = await compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
