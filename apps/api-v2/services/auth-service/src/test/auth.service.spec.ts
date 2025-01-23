// auth.service.spec.ts
import { status } from '@grpc/grpc-js';
import { AuthProto, UsersProto } from '@microservices/proto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { of, throwError } from 'rxjs';
import { AuthService } from '../auth.service';

// Add interfaces for mocked services
interface MockedUsersService {
  createUser: jest.Mock;
  getUserByEmail: jest.Mock;
  updateUser: jest.Mock;
}

interface MockedJwtService {
  sign: jest.Mock;
}

interface TokenOptions {
  secret: string;
  expiresIn: number;
}

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: MockedUsersService;
  let jwtService: MockedJwtService;
  let mockConfigService: { getOrThrow: jest.Mock };

  const mockUsersClient = {
    getService: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService = {
      getOrThrow: jest.fn(),
    };

    // Type-safe mock initialization
    usersService = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      updateUser: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    mockUsersClient.getService.mockReturnValue(usersService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'USERS_SERVICE',
          useValue: mockUsersClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(
      JwtService,
    ) as unknown as MockedJwtService;

    // Common config mocks
    mockConfigService.getOrThrow.mockImplementation((key: string): string => {
      const config: Record<string, string> = {
        JWT_ACCESS_TOKEN_EXPIRATION_MS: '900000',
        JWT_REFRESH_TOKEN_EXPIRATION_MS: '604800000',
        JWT_ACCESS_TOKEN_SECRET: 'access-secret',
        JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
        AUTH_UI_REDIRECT: 'http://localhost:3000',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockCreateUserDto: AuthProto.CreateUserDto = {
      $type: 'api.auth.CreateUserDto',
      email: 'test@test.com',
      password: 'password',
      username: 'testuser',
    };

    const mockNewUser: UsersProto.User = {
      $type: 'api.users.User',
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
    };

    beforeEach(() => {
      mockJwtService.sign.mockImplementation((payload, options) => {
        return options.secret === 'access-secret'
          ? 'access-token'
          : 'refresh-token';
      });
    });

    it('should successfully register a new user', async () => {
      usersService.createUser.mockReturnValue(of(mockNewUser));

      const result = await service.register(mockCreateUserDto);

      expect(result.$type).toBe('api.auth.AuthResponse');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.expiresAccessToken).toBeDefined();
      expect(result.expiresRefreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException when user creation fails', async () => {
      usersService.createUser.mockReturnValue(
        throwError(() => new Error('Creation failed')),
      );

      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        'User registration failed',
      );
    });

    it('should handle error logging in register', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      usersService.createUser.mockReturnValue(
        throwError(() => new Error('Registration error')),
      );

      await expect(service.register(mockCreateUserDto)).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('login', () => {
    const mockUser: AuthProto.User = {
      $type: 'api.auth.User',
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      mockJwtService.sign.mockImplementation((payload, options) => {
        return options.secret === 'access-secret'
          ? 'access-token'
          : 'refresh-token';
      });
      usersService.updateUser.mockReturnValue(of({}));
    });

    it('should successfully login a user', async () => {
      const result = await service.login(mockUser);

      expect(result.$type).toBe('api.auth.AuthResponse');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.expiresAccessToken).toBeDefined();
      expect(result.expiresRefreshToken).toBeDefined();
    });

    it('should handle redirect flag', async () => {
      const result = await service.login(mockUser, true);

      expect(result.redirect).toBe(true);
      expect(result.redirectUrl).toBe('http://localhost:3000');
    });

    it('should throw RpcException when user data is invalid', async () => {
      const invalidUser = { $type: 'api.auth.User' } as AuthProto.User;

      await expect(service.login(invalidUser)).rejects.toThrow(RpcException);
    });

    it('should handle error logging in login', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Test error');
      mockJwtService.sign.mockImplementation(() => {
        throw mockError;
      });

      await expect(service.login(mockUser)).rejects.toThrow(RpcException);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in login:',
        expect.objectContaining({
          err: expect.any(Error),
          user: expect.objectContaining({ email: mockUser.email }),
          stack: expect.any(String),
        }),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle RpcException propagation in login', async () => {
      const rpcError = new RpcException({
        code: status.INTERNAL,
        message: 'Original RPC error',
      });

      usersService.updateUser.mockReturnValue(throwError(() => rpcError));

      await expect(service.login(mockUser)).rejects.toThrow(rpcError);
    });

    it('should handle undefined user in login', async () => {
      await expect(service.login({} as AuthProto.User)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('refreshToken', () => {
    const mockUser: AuthProto.User = {
      $type: 'api.auth.User',
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
    };

    beforeEach(() => {
      jest.clearAllMocks();

      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh-token');
      mockJwtService.sign.mockImplementation((payload, options) => {
        return options.secret === 'access-secret'
          ? 'new-access-token'
          : 'new-refresh-token';
      });
      usersService.updateUser.mockReturnValue(of({}));
    });

    it('should successfully refresh tokens', async () => {
      const result = await service.refreshToken(mockUser);

      expect(result.$type).toBe('api.auth.AuthResponse');
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.expiresAccessToken).toBeDefined();
      expect(result.expiresRefreshToken).toBeDefined();

      expect(usersService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          $type: 'api.users.UpdateUserRequest',
          query: expect.objectContaining({
            userId: mockUser.id.toString(),
            email: mockUser.email,
          }),
          data: expect.objectContaining({
            refreshToken: 'new-hashed-refresh-token',
          }),
        }),
      );
    });

    it('should throw RpcException when token refresh fails', async () => {
      (usersService.updateUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('Update failed')),
      );

      await expect(service.refreshToken(mockUser)).rejects.toThrow(
        RpcException,
      );
    });

    it('should handle console logging in refreshToken', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.refreshToken(mockUser);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Refreshing tokens for user:',
        expect.objectContaining({ email: mockUser.email }),
      );

      consoleSpy.mockRestore();
    });

    it('should handle error logging in refreshToken', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (usersService.updateUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('Refresh error')),
      );

      await expect(service.refreshToken(mockUser)).rejects.toThrow(
        RpcException,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error refreshing token:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('verifyUser', () => {
    const mockEmail = 'test@test.com';
    const mockPassword = 'password';
    const mockUser: UsersProto.User = {
      $type: 'api.users.User',
      id: 1,
      email: mockEmail,
      username: 'testuser',
      password: 'hashed-password',
    };

    it('should successfully verify user credentials', async () => {
      (usersService.getUserByEmail as jest.Mock).mockReturnValue(of(mockUser));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyUser(mockEmail, mockPassword);

      expect(result.$type).toBe('api.auth.User');
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw RpcException when user is not found', async () => {
      (usersService.getUserByEmail as jest.Mock).mockReturnValue(of(null));

      await expect(service.verifyUser(mockEmail, mockPassword)).rejects.toThrow(
        RpcException,
      );
    });

    it('should throw RpcException when password is invalid', async () => {
      (usersService.getUserByEmail as jest.Mock).mockReturnValue(of(mockUser));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.verifyUser(mockEmail, mockPassword)).rejects.toThrow(
        RpcException,
      );
    });

    it('should handle service errors in verifyUser', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      usersService.getUserByEmail.mockReturnValue(
        throwError(() => new Error('Service error')),
      );

      await expect(
        service.verifyUser('test@test.com', 'password'),
      ).rejects.toThrow(RpcException);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle error logging in verifyUser', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Test error');

      usersService.getUserByEmail.mockReturnValue(throwError(() => mockError));

      try {
        await service.verifyUser('test@test.com', 'password');
      } catch (error: unknown) {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in verifyUser:', {
          message: mockError.message,
          stack: expect.any(String),
        });
      }

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing email in verifyUser', async () => {
      await expect(service.verifyUser('', 'password')).rejects.toThrow(
        RpcException,
      );
    });

    it('should handle RpcException with correct status code', async () => {
      usersService.getUserByEmail.mockReturnValue(
        throwError(() => new Error('Service error')),
      );

      try {
        await service.verifyUser('test@test.com', 'password');
        fail('Expected error to be thrown');
      } catch (error) {
        if (error instanceof RpcException) {
          const rpcError = error.getError() as {
            code: number;
            message: string;
          };
          expect(rpcError).toEqual(
            expect.objectContaining({
              code: status.INTERNAL,
              message: 'Internal server error',
            }),
          );
        }
      }
    });
  });

  describe('verifyUserRefreshToken', () => {
    const mockEmail = 'test@test.com';
    const mockRefreshToken = 'refresh-token';
    const mockUser: UsersProto.User = {
      $type: 'api.users.User',
      id: 1,
      email: mockEmail,
      username: 'testuser',
      refreshToken: 'hashed-refresh-token',
    };

    it('should successfully verify refresh token', async () => {
      usersService.getUserByEmail.mockReturnValue(of(mockUser));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyUserRefreshToken(
        mockRefreshToken,
        mockEmail,
      );

      expect(result.$type).toBe('api.auth.User');
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw RpcException when refresh token is invalid', async () => {
      usersService.getUserByEmail.mockReturnValue(of(mockUser));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyUserRefreshToken(mockRefreshToken, mockEmail),
      ).rejects.toThrow(RpcException);
    });

    it('should throw RpcException when user has no refresh token', async () => {
      const userWithoutToken = { ...mockUser, refreshToken: null };
      usersService.getUserByEmail.mockReturnValue(of(userWithoutToken));

      await expect(
        service.verifyUserRefreshToken(mockRefreshToken, mockEmail),
      ).rejects.toThrow(RpcException);
    });

    it('should handle console logging in verifyUserRefreshToken', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      usersService.getUserByEmail.mockReturnValue(of(mockUser));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.verifyUserRefreshToken('refresh-token', 'test@test.com');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Verifying refresh token for:',
        expect.objectContaining({ email: 'test@test.com' }),
      );

      consoleSpy.mockRestore();
    });

    it('should handle error logging in verifyUserRefreshToken', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      usersService.getUserByEmail.mockReturnValue(
        throwError(() => new Error('Verification error')),
      );

      await expect(
        service.verifyUserRefreshToken('refresh-token', 'test@test.com'),
      ).rejects.toThrow(RpcException);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error verifying refresh token:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle null refresh token in verifyUserRefreshToken', async () => {
      await expect(
        service.verifyUserRefreshToken('', 'test@test.com'),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('dateToTimestamp', () => {
    it('should convert Date to Timestamp', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const result = (service as any).dateToTimestamp(date);

      expect(result).toEqual({
        $type: 'google.protobuf.Timestamp',
        seconds: Math.floor(date.getTime() / 1000),
        nanos: (date.getTime() % 1000) * 1000000,
      });
    });
  });

  describe('createTokenPayload', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log and create token payload', () => {
      const mockUser: AuthProto.User = {
        $type: 'api.auth.User',
        id: 1,
        email: 'test@test.com',
        username: 'testuser',
      };

      const result = (service as any).createTokenPayload(mockUser);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Creating token payload for user:',
        expect.objectContaining({ email: mockUser.email }),
      );

      expect(result).toEqual({
        $type: 'api.auth.TokenPayload',
        userId: '1',
        email: 'test@test.com',
      });
    });
  });

  describe('updateUserRefreshToken', () => {
    it('should update user refresh token', async () => {
      const mockTokenPayload: AuthProto.TokenPayload = {
        $type: 'api.auth.TokenPayload',
        userId: '1',
        email: 'test@test.com',
      };
      const mockRefreshTokenHash = 'hashed-token';

      (usersService.updateUser as jest.Mock).mockReturnValue(of({}));

      await (service as any).updateUserRefreshToken(
        mockTokenPayload,
        mockRefreshTokenHash,
      );

      expect(usersService.updateUser).toHaveBeenCalledWith({
        $type: 'api.users.UpdateUserRequest',
        query: {
          $type: 'api.users.TokenPayload',
          userId: mockTokenPayload.userId,
          email: mockTokenPayload.email,
        },
        data: {
          $type: 'api.users.ReceivedRefreshToken',
          refreshToken: mockRefreshTokenHash,
        },
      });
    });

    it('should handle update failure', async () => {
      const mockTokenPayload: AuthProto.TokenPayload = {
        $type: 'api.auth.TokenPayload',
        userId: '1',
        email: 'test@test.com',
      };
      const mockRefreshTokenHash = 'hashed-token';

      (usersService.updateUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('Update failed')),
      );

      await expect(
        (service as any).updateUserRefreshToken(
          mockTokenPayload,
          mockRefreshTokenHash,
        ),
      ).rejects.toThrow();
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const mockPayload: AuthProto.TokenPayload = {
        $type: 'api.auth.TokenPayload',
        userId: '1',
        email: 'test@test.com',
      };

      mockJwtService.sign.mockImplementation((payload, options) => {
        return options.secret === 'access-secret'
          ? 'access-token'
          : 'refresh-token';
      });

      const result = await (service as any).generateTokens(mockPayload);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId: mockPayload.userId, email: mockPayload.email },
        expect.any(Object),
      );
    });

    it('should use correct expiration times for token generation', async () => {
      const mockPayload: AuthProto.TokenPayload = {
        $type: 'api.auth.TokenPayload',
        userId: '1',
        email: 'test@test.com',
      };

      await (service as any).generateTokens(mockPayload);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          expiresIn: 900, // 15 minutes in seconds
          secret: 'access-secret',
        }),
      );

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          expiresIn: 604800, // 7 days in seconds
          secret: 'refresh-secret',
        }),
      );
    });

    it('should handle token generation failure', async () => {
      const mockPayload: AuthProto.TokenPayload = {
        $type: 'api.auth.TokenPayload',
        userId: '1',
        email: 'test@test.com',
      };

      mockJwtService.sign.mockImplementation(() => {
        throw new Error('Token generation failed');
      });

      await expect(
        (service as any).generateTokens(mockPayload),
      ).rejects.toThrow();
    });
  });

  describe('getTokenExpirations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate token expiration timestamps', () => {
      const result = (service as any).getTokenExpirations();

      expect(result).toHaveProperty('expiresAccessToken');
      expect(result).toHaveProperty('expiresRefreshToken');
      expect(result.expiresAccessToken.$type).toBe('google.protobuf.Timestamp');
      expect(result.expiresRefreshToken.$type).toBe(
        'google.protobuf.Timestamp',
      );
    });

    it('should use correct expiration times from config', () => {
      const accessTokenExp = 900000; // 15 minutes in milliseconds
      const refreshTokenExp = 604800000; // 7 days in milliseconds
      const baseTime = new Date('2024-01-01T00:00:00Z');

      mockConfigService.getOrThrow.mockImplementation((key: string) => {
        const config = {
          JWT_ACCESS_TOKEN_EXPIRATION_MS: accessTokenExp.toString(),
          JWT_REFRESH_TOKEN_EXPIRATION_MS: refreshTokenExp.toString(),
          JWT_ACCESS_TOKEN_SECRET: 'access-secret',
          JWT_REFRESH_TOKEN_SECRET: 'refresh-secret',
          AUTH_UI_REDIRECT: 'http://localhost:3000',
        };
        return config[key];
      });

      const result = (service as any).getTokenExpirations();
      const baseTimeSeconds = Math.floor(baseTime.getTime() / 1000);

      expect(result.expiresAccessToken.seconds - baseTimeSeconds).toBe(
        accessTokenExp / 1000,
      );
      expect(result.expiresRefreshToken.seconds - baseTimeSeconds).toBe(
        refreshTokenExp / 1000,
      );

      expect(result.expiresAccessToken.nanos).toBe(0);
      expect(result.expiresRefreshToken.nanos).toBe(0);
    });
  });
});
