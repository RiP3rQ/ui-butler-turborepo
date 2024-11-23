import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import type { Response as ExpressResponse } from 'express';
import { TokenPayload } from './token-payload.interface';
import type { User } from '../database/schemas/users';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateTokens(payload: TokenPayload) {
    const accessTokenOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
    };

    const refreshTokenOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
    };

    const accessToken = this.jwtService.sign(
      payload as object,
      accessTokenOptions,
    );
    const refreshToken = this.jwtService.sign(
      payload as object,
      refreshTokenOptions,
    );

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

  private setCookies(
    res: ExpressResponse,
    {
      accessToken,
      refreshToken,
    }: { accessToken: string; refreshToken: string },
    {
      expiresAccessToken,
      expiresRefreshToken,
    }: { expiresAccessToken: Date; expiresRefreshToken: Date },
  ) {
    const cookieOptions = {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
    };

    res.cookie('Authentication', accessToken, {
      ...cookieOptions,
      expires: expiresAccessToken,
    });

    res.cookie('Refresh', refreshToken, {
      ...cookieOptions,
      expires: expiresRefreshToken,
    });
  }

  async login(user: User, response: ExpressResponse, redirect = false) {
    const tokenPayload: TokenPayload = {
      userId: user.id.toString(),
      email: user.email ?? '',
    };

    const { accessToken, refreshToken } =
      await this.generateTokens(tokenPayload);
    const expirations = this.getTokenExpirations();

    const refreshTokenData = await hash(refreshToken, 10);

    await this.usersService.updateUser(tokenPayload, {
      refreshToken: refreshTokenData,
    });

    this.setCookies(response, { accessToken, refreshToken }, expirations);

    if (redirect) {
      response.redirect(this.configService.getOrThrow('AUTH_UI_REDIRECT'));
    }
  }

  async register(
    user: { email: string; password: string; username: string },
    response: ExpressResponse,
  ) {
    const newUser = await this.usersService.createUser(user);

    const tokenPayload: TokenPayload = {
      userId: newUser?.id.toString() ?? '',
      email: user.email,
    };

    const { accessToken, refreshToken } =
      await this.generateTokens(tokenPayload);
    const expirations = this.getTokenExpirations();

    this.setCookies(response, { accessToken, refreshToken }, expirations);
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({
        email,
      });
      const authenticated = await compare(password, user?.password ?? '');
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async veryifyUserRefreshToken(refreshToken: string, email: string) {
    try {
      const user = await this.usersService.getUser({ email: email });

      if (!user?.refreshToken || !refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const authenticated = compare(refreshToken, user.refreshToken);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
