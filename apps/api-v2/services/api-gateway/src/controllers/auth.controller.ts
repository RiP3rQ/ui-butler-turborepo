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
  CreateUserDto,
  CurrentUser,
  GithubAuthGuard,
  GoogleAuthGuard,
  JwtRefreshAuthGuard,
  LocalAuthGuard,
  type User,
} from '@app/common';
import { AuthProxyService } from '../proxies/auth.proxy.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authProxyService.login({ user });
    this.setCookies(response, result);
    return result;
  }

  @Post('register')
  async register(
    @Body() user: CreateUserDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    if (!user) {
      throw new NotFoundException('User not found in request body');
    }
    const result = await this.authProxyService.register({ user });
    this.setCookies(response, result);
    return result;
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authProxyService.refresh({ user });
    this.setCookies(response, result);
    return result;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  loginGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authProxyService.googleCallback({ user });
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
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authProxyService.githubCallback({ user });
    this.setCookies(response, result);
    if (result.redirect) {
      response.redirect(result.redirectUrl);
    }
    return result;
  }

  private setCookies(response: ExpressResponse, authData: any) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    response.cookie('Authentication', authData.accessToken, {
      ...cookieOptions,
      expires: new Date(authData.expiresAccessToken),
    });

    response.cookie('Refresh', authData.refreshToken, {
      ...cookieOptions,
      expires: new Date(authData.expiresRefreshToken),
    });
  }
}
