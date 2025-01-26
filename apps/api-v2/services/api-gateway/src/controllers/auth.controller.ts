// auth.controller.ts
import {
  CurrentUser,
  GithubAuthGuard,
  GoogleAuthGuard,
  JwtRefreshAuthGuard,
  LocalAuthGuard,
} from '@microservices/common';
import { AuthProto } from '@microservices/proto';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
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
import { type Response } from 'express';
import { AuthProxyService } from '../proxies/auth.proxy.service';

/**
 * Authentication controller handling user registration, login, and OAuth flows
 * @remarks Uses gRPC for communication with auth microservice
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authProxyService: AuthProxyService) {}

  /**
   * Register a new user
   * @param userData - User registration data
   * @param response - Express response object for setting cookies
   * @returns AuthResponse with tokens and expiration times
   * @throws {NotFoundException} When user data is missing
   * @throws {RpcException} When gRPC auth service fails
   */
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
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: JSON.stringify(AuthProto.AuthResponse),
  })
  @ApiNotFoundResponse({
    description: 'User data not found in request body',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  public async register(
    @Body() userData: Readonly<AuthProto.CreateUserDto>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
    if (!userData.email || !userData.password) {
      throw new NotFoundException('Required user data missing in request body');
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

  /**
   * Authenticate user login
   * @param user - User data from LocalAuthGuard
   * @param response - Express response object
   * @returns AuthResponse with tokens
   * @throws {UnauthorizedException} When credentials are invalid
   */
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
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: JSON.stringify(AuthProto.AuthResponse),
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  public async login(
    @CurrentUser() user: Readonly<AuthProto.User>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
    if (!user.id || !user.email) {
      throw new UnauthorizedException('Invalid user data provided');
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
      this.setCookies(response, result);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Refresh access token using refresh token
   * @param user - User data from JwtRefreshAuthGuard
   * @param response - Express response object
   * @returns AuthResponse with new tokens
   * @throws {UnauthorizedException} When refresh token is invalid
   */
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token',
  })
  @ApiCookieAuth('Refresh')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'New access token generated',
    type: JSON.stringify(AuthProto.AuthResponse),
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  public async refreshToken(
    @CurrentUser() user: Readonly<AuthProto.User>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthProto.AuthResponse> {
    try {
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

  /**
   * Set authentication cookies in response
   * @param response - Express response object
   * @param authData - Authentication response data
   */
  private setCookies(
    response: Response,
    authData: Readonly<AuthProto.AuthResponse>,
  ): void {
    if (!authData.expiresAccessToken || !authData.expiresRefreshToken) {
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
      throw new UnauthorizedException('Failed to set authentication cookies');
    }
  }
}
