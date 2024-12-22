// auth.controller.ts
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Response as ExpressResponse } from 'express';
import {
  CurrentUser,
  GithubAuthGuard,
  GoogleAuthGuard,
  JwtRefreshAuthGuard,
  LocalAuthGuard,
} from '@app/common';
import { AuthProxyService } from '../proxies/auth.proxy.service';
import { AuthProto } from '@app/proto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const loginRequest: AuthProto.LoginRequest = {
      $type: 'api.auth.LoginRequest',
      user: {
        ...user,
        $type: 'api.auth.User',
      },
    };

    const result = await this.authProxyService.login(loginRequest);
    this.setCookies(response, result);
    return result;
  }

  @Post('register')
  async register(
    @Body() userData: AuthProto.CreateUserDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    if (!userData) {
      throw new NotFoundException('User not found in request body');
    }

    const registerRequest: AuthProto.RegisterRequest = {
      $type: 'api.auth.RegisterRequest',
      user: {
        ...userData,
        $type: 'api.auth.CreateUserDto',
      },
    };

    const result = await this.authProxyService.register(registerRequest);
    this.setCookies(response, result);
    return result;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const refreshRequest: AuthProto.RefreshTokenRequest = {
      $type: 'api.auth.RefreshTokenRequest',
      user: {
        ...user,
        $type: 'api.auth.User',
      },
    };

    const result = await this.authProxyService.refreshToken(refreshRequest);
    this.setCookies(response, result);
    return result;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const callbackRequest: AuthProto.SocialCallbackRequest = {
      $type: 'api.auth.SocialCallbackRequest',
      user: {
        ...user,
        $type: 'api.auth.User',
      },
    };

    const result = await this.authProxyService.googleCallback(callbackRequest);
    this.setCookies(response, result);
    if (result.redirect) {
      response.redirect(result.redirectUrl);
    }
    return result;
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  loginGithub() {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const callbackRequest: AuthProto.SocialCallbackRequest = {
      $type: 'api.auth.SocialCallbackRequest',
      user: {
        ...user,
        $type: 'api.auth.User',
      },
    };

    const result = await this.authProxyService.githubCallback(callbackRequest);
    this.setCookies(response, result);
    if (result.redirect) {
      response.redirect(result.redirectUrl);
    }
    return result;
  }

  private setCookies(
    response: ExpressResponse,
    authData: AuthProto.AuthResponse,
  ) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    const expiresAccessToken = new Date(
      authData.expiresAccessToken.seconds * 1000 +
        Math.floor(authData.expiresAccessToken.nanos / 1000000),
    );

    const expiresRefreshToken = new Date(
      authData.expiresRefreshToken.seconds * 1000 +
        Math.floor(authData.expiresRefreshToken.nanos / 1000000),
    );

    response.cookie('Authentication', authData.accessToken, {
      ...cookieOptions,
      expires: expiresAccessToken,
    });

    response.cookie('Refresh', authData.refreshToken, {
      ...cookieOptions,
      expires: expiresRefreshToken,
    });
  }
}
