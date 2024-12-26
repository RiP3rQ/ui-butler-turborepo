// auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { AuthProto } from '@app/proto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    verifyUserRefreshToken: jest.fn(),
    verifyUser: jest.fn(),
  };

  beforeEach(async () => {
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
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      const mockUser: AuthProto.CreateUserDto = {
        $type: 'api.auth.CreateUserDto',
        email: 'test@test.com',
        password: 'password',
      };
      const mockResponse = {
        $type: 'api.auth.AuthResponse',
        accessToken: 'token',
        refreshToken: 'refresh',
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register({
        $type: 'api.auth.RegisterRequest',
        user: mockUser,
      });

      expect(service.register).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('login', () => {
    const mockUser: AuthProto.User = {
      $type: 'api.auth.User',
      id: 1,
      email: 'test@test.com',
      username: 'test',
      password: 'password',
    };
    const mockResponse = {
      $type: 'api.auth.AuthResponse',
      accessToken: 'token',
      refreshToken: 'refresh',
    };

    it('should call authService.login with correct parameters', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login({
        $type: 'api.auth.LoginRequest',
        user: mockUser,
      });

      expect(service.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResponse);
    });

    it('should throw RpcException if user is not provided', async () => {
      await expect(
        controller.login({
          $type: 'api.auth.LoginRequest',
          user: null,
        }),
      ).rejects.toThrow(
        new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'User data is required',
        }),
      );
    });
  });

  describe('refreshToken', () => {
    const mockUser: AuthProto.User = {
      $type: 'api.auth.User',
      id: 1,
      email: 'test@test.com',
      username: 'test',
      refreshToken: 'refresh',
    };
    const mockResponse = {
      $type: 'api.auth.AuthResponse',
      accessToken: 'newToken',
      refreshToken: 'newRefresh',
    };

    it('should call authService.login with correct parameters', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.refreshToken({
        $type: 'api.auth.RefreshTokenRequest',
        user: mockUser,
      });

      expect(service.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockResponse);
    });

    it('should throw RpcException if user is not provided', async () => {
      await expect(
        controller.refreshToken({
          $type: 'api.auth.RefreshTokenRequest',
          user: null,
        }),
      ).rejects.toThrow(
        new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'User data is required',
        }),
      );
    });
  });

  describe('social callbacks', () => {
    const mockUser: AuthProto.User = {
      $type: 'api.auth.User',
      id: 1,
      email: 'test@test.com',
      username: 'test',
    };
    const mockResponse = {
      $type: 'api.auth.AuthResponse',
      accessToken: 'token',
      refreshToken: 'refresh',
    };

    it('should handle Google callback', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.googleCallback({
        $type: 'api.auth.SocialCallbackRequest',
        user: mockUser,
      });

      expect(service.login).toHaveBeenCalledWith(mockUser, true);
      expect(result).toEqual(mockResponse);
    });

    it('should handle Github callback', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.githubCallback({
        $type: 'api.auth.SocialCallbackRequest',
        user: mockUser,
      });

      expect(service.login).toHaveBeenCalledWith(mockUser, true);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should call authService.verifyUserRefreshToken with correct parameters', async () => {
      const mockRequest: AuthProto.VerifyRefreshTokenRequest = {
        $type: 'api.auth.VerifyRefreshTokenRequest',
        refreshToken: 'refresh',
        email: 'test@test.com',
      };
      const mockUser: AuthProto.User = {
        $type: 'api.auth.User',
        id: 1,
        email: 'test@test.com',
        username: 'test',
      };

      mockAuthService.verifyUserRefreshToken.mockResolvedValue(mockUser);

      const result = await controller.verifyRefreshToken(mockRequest);

      expect(service.verifyUserRefreshToken).toHaveBeenCalledWith(
        mockRequest.refreshToken,
        mockRequest.email,
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyUser', () => {
    const mockRequest: AuthProto.VerifyUserRequest = {
      $type: 'api.auth.VerifyUserRequest',
      email: 'test@test.com',
      password: 'password',
    };

    it('should return user when verification succeeds', async () => {
      const mockUser: AuthProto.User = {
        $type: 'api.auth.User',
        id: 1,
        email: 'test@test.com',
        username: 'test',
      };
      mockAuthService.verifyUser.mockResolvedValue(mockUser);

      const result = await controller.verifyUser(mockRequest);

      expect(service.verifyUser).toHaveBeenCalledWith(
        mockRequest.email,
        mockRequest.password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when verification fails', async () => {
      mockAuthService.verifyUser.mockRejectedValue(
        new Error('Verification failed'),
      );

      const result = await controller.verifyUser(mockRequest);

      expect(service.verifyUser).toHaveBeenCalledWith(
        mockRequest.email,
        mockRequest.password,
      );
      expect(result).toBeNull();
    });
  });
});
