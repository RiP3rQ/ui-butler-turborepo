import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Response as ExpressResponse } from 'express';
import { CreateUserDto } from '../../../../src/users/dto/create-user.dto';
import { GoogleAuthGuard } from '../../../../src/auth/guards/google-auth.guard';
import { type User } from '../../../../src/database/schemas/users';
import { CurrentUser } from '../../../../src/auth/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  async login(
    @Body() credentials: any,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'auth.login' }, credentials),
    );
    this.setAuthCookies(response, result);
    return result;
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'auth.register' }, createUserDto),
    );
    this.setAuthCookies(response, result);
    return result;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    return this.authClient.send({ cmd: 'auth.google' }, {});
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await firstValueFrom(
      this.authClient.send({ cmd: 'auth.google.callback' }, { user }),
    );
    this.setAuthCookies(response, result);
    return result;
  }

  private setAuthCookies(response: ExpressResponse, authData: any) {
    const {
      accessToken,
      refreshToken,
      expiresAccessToken,
      expiresRefreshToken,
    } = authData;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    response.cookie('Authentication', accessToken, {
      ...cookieOptions,
      expires: new Date(expiresAccessToken),
    });

    response.cookie('Refresh', refreshToken, {
      ...cookieOptions,
      expires: new Date(expiresRefreshToken),
    });
  }
}
