import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto, User } from '@app/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    username: 'Test User',
    password: 'password',
    refreshToken: 'refresh_token',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
    username: 'Test User',
  };

  // Regular auth response
  const mockAuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAccessToken: new Date(Date.now() + 3600000), // 1 hour from now
    expiresRefreshToken: new Date(Date.now() + 86400000), // 24 hours from now
  };

  // OAuth auth response
  const mockOAuthResponse = {
    redirect: true,
    redirectUrl: 'http://example.com/callback',
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAccessToken: new Date(Date.now() + 3600000),
    expiresRefreshToken: new Date(Date.now() + 86400000),
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      verifyUserRefreshToken: jest.fn(),
      verifyUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login with user', async () => {
      service.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login({ user: mockUser });

      expect(service.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle login errors', async () => {
      const error = new Error('Login failed');
      service.login.mockRejectedValue(error);

      await expect(controller.login({ user: mockUser })).rejects.toThrow(error);
    });
  });

  describe('register', () => {
    it('should call authService.register with createUserDto', async () => {
      service.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register({ user: mockCreateUserDto });

      expect(service.register).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle registration errors', async () => {
      const error = new Error('Registration failed');
      service.register.mockRejectedValue(error);

      await expect(
        controller.register({ user: mockCreateUserDto }),
      ).rejects.toThrow(error);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.login with user for token refresh', async () => {
      service.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.refreshToken({ user: mockUser });

      expect(service.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle refresh token errors', async () => {
      const error = new Error('Token refresh failed');
      service.login.mockRejectedValue(error);

      await expect(controller.refreshToken({ user: mockUser })).rejects.toThrow(
        error,
      );
    });
  });

  describe('googleCallback', () => {
    it('should call authService.login with user and isOAuth flag', async () => {
      service.login.mockResolvedValue(mockOAuthResponse);

      const result = await controller.googleCallback({ user: mockUser });

      expect(service.login).toHaveBeenCalledWith(mockUser, true);
      expect(result).toEqual(mockOAuthResponse);
    });

    it('should handle Google callback errors', async () => {
      const error = new Error('Google callback failed');
      service.login.mockRejectedValue(error);

      await expect(
        controller.googleCallback({ user: mockUser }),
      ).rejects.toThrow(error);
    });
  });

  describe('githubCallback', () => {
    it('should call authService.login with user and isOAuth flag', async () => {
      service.login.mockResolvedValue(mockOAuthResponse);

      const result = await controller.githubCallback({ user: mockUser });

      expect(service.login).toHaveBeenCalledWith(mockUser, true);
      expect(result).toEqual(mockOAuthResponse);
    });

    it('should handle GitHub callback errors', async () => {
      const error = new Error('GitHub callback failed');
      service.login.mockRejectedValue(error);

      await expect(
        controller.githubCallback({ user: mockUser }),
      ).rejects.toThrow(error);
    });
  });

  describe('verifyRefreshToken', () => {
    const mockTokenData = {
      refreshToken: 'mock-refresh-token',
      email: 'test@example.com',
    };

    it('should call authService.verifyUserRefreshToken with token and email', async () => {
      service.verifyUserRefreshToken.mockResolvedValue(true);

      const result = await controller.verifyRefreshToken(mockTokenData);

      expect(service.verifyUserRefreshToken).toHaveBeenCalledWith(
        mockTokenData.refreshToken,
        mockTokenData.email,
      );
      expect(result).toBe(true);
    });

    it('should handle verify refresh token errors', async () => {
      const error = new Error('Token verification failed');
      service.verifyUserRefreshToken.mockRejectedValue(error);

      await expect(
        controller.verifyRefreshToken(mockTokenData),
      ).rejects.toThrow(error);
    });
  });

  describe('verifyUser', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should call authService.verifyUser with credentials and return user', async () => {
      service.verifyUser.mockResolvedValue(mockUser);

      const result = await controller.verifyUser(mockCredentials);

      expect(service.verifyUser).toHaveBeenCalledWith(
        mockCredentials.email,
        mockCredentials.password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when verification fails', async () => {
      service.verifyUser.mockRejectedValue(new Error('Verification failed'));

      const result = await controller.verifyUser(mockCredentials);

      expect(result).toBeNull();
      expect(service.verifyUser).toHaveBeenCalledWith(
        mockCredentials.email,
        mockCredentials.password,
      );
    });

    it('should log error when verification fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Verification failed');
      service.verifyUser.mockRejectedValue(error);

      await controller.verifyUser(mockCredentials);

      expect(consoleSpy).toHaveBeenCalledWith(
        'User verification failed:',
        error,
      );
      consoleSpy.mockRestore();
    });
  });
});
