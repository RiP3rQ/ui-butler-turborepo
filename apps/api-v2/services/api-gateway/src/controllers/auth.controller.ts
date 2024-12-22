// auth.controller.ts
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { type Response } from 'express';
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

  @Post('register')
  async register(
    @Body() userData: AuthProto.CreateUserDto,
    @Res({ passthrough: true }) response: Response,
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

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!user) {
      throw new UnauthorizedException('No user data provided');
    }

    const loginRequest: AuthProto.LoginRequest = {
      $type: 'api.auth.LoginRequest',
      user: {
        $type: 'api.auth.User',
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };

    try {
      const result = await this.authProxyService.login(loginRequest);
      if (result) {
        this.setCookies(response, result);
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Login failed');
    }
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      console.log('Refresh token request for user:', { email: user.email });

      const refreshRequest: AuthProto.RefreshTokenRequest = {
        $type: 'api.auth.RefreshTokenRequest',
        user: {
          $type: 'api.auth.User',
          id: user.id,
          email: user.email,
          username: user.username,
        },
      };

      const result = await this.authProxyService.refreshToken(refreshRequest);

      if (!result) {
        throw new UnauthorizedException('Token refresh failed');
      }

      this.setCookies(response, result);
      return result;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Token refresh failed');
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: Response,
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
    @Res({ passthrough: true }) response: Response,
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

  private setCookies(response: Response, authData: AuthProto.AuthResponse) {
    if (!authData?.expiresAccessToken || !authData?.expiresRefreshToken) {
      console.error('Invalid auth data received:', authData);
      return;
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    try {
      const expiresAccessToken = new Date(
        (authData.expiresAccessToken.seconds || 0) * 1000 +
          Math.floor((authData.expiresAccessToken.nanos || 0) / 1000000),
      );

      const expiresRefreshToken = new Date(
        (authData.expiresRefreshToken.seconds || 0) * 1000 +
          Math.floor((authData.expiresRefreshToken.nanos || 0) / 1000000),
      );

      if (authData.accessToken) {
        response.cookie('Authentication', authData.accessToken, {
          ...cookieOptions,
          expires: expiresAccessToken,
        });
      }

      if (authData.refreshToken) {
        response.cookie('Refresh', authData.refreshToken, {
          ...cookieOptions,
          expires: expiresRefreshToken,
        });
      }
    } catch (error) {
      console.error('Error setting cookies:', error);
      // You might want to throw an error here or handle it differently
    }
  }
}
