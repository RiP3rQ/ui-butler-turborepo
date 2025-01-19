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
import { AuthProto } from '@app/proto';
import {
  ApiBody,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOAuth2,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthProxyService } from '../proxies/auth.proxy.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account and return authentication tokens',
  })
  @ApiBody({
    type: 'object',
    required: true,
    schema: {
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        username: { type: 'string', nullable: false },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiNotFoundResponse({
    description: 'User data not found in request body',
  })
  public async register(
    @Body() userData: AuthProto.CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
    if (typeof userData === 'undefined') {
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
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return access tokens',
  })
  @ApiBody({
    type: 'object',
    required: true,
    schema: {
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  public async login(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
    if (typeof user === 'undefined') {
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
      if (typeof result !== 'undefined') {
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
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token',
  })
  @ApiCookieAuth('Refresh')
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  public async refreshToken(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
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

      if (typeof result === 'undefined') {
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
  @ApiOperation({
    summary: 'Google OAuth login',
    description: 'Initiate Google OAuth authentication flow',
  })
  @ApiOAuth2(['email', 'profile'])
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google login page',
  })
  public loginGoogle(): void {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handle Google OAuth callback and authenticate user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated with Google',
  })
  public async googleCallback(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
    const callbackRequest: AuthProto.SocialCallbackRequest = {
      $type: 'api.auth.SocialCallbackRequest',
      user: {
        ...user,
        $type: 'api.auth.User',
      },
    };

    const result = await this.authProxyService.googleCallback(callbackRequest);
    this.setCookies(response, result);
    if (typeof result.redirectUrl !== 'undefined') {
      response.redirect(result.redirectUrl);
    }
    return result;
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'GitHub OAuth login',
    description: 'Initiate GitHub OAuth authentication flow',
  })
  @ApiOAuth2(['user:email'])
  @ApiResponse({
    status: 302,
    description: 'Redirect to GitHub login page',
  })
  public loginGithub(): void {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({
    summary: 'GitHub OAuth callback',
    description: 'Handle GitHub OAuth callback and authenticate user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated with GitHub',
  })
  public async githubCallback(
    @CurrentUser() user: AuthProto.User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
    const callbackRequest: AuthProto.SocialCallbackRequest = {
      $type: 'api.auth.SocialCallbackRequest',
      user: {
        ...user,
        $type: 'api.auth.User',
      },
    };

    const result = await this.authProxyService.githubCallback(callbackRequest);
    this.setCookies(response, result);
    if (typeof result.redirectUrl !== 'undefined') {
      response.redirect(result.redirectUrl);
    }
    return result;
  }

  private setCookies(response: Response, authData: AuthProto.AuthResponse) {
    if (
      typeof authData.expiresAccessToken === 'undefined' ||
      typeof authData.expiresRefreshToken === 'undefined'
    ) {
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
