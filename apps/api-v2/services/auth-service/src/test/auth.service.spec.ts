// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { AuthService } from '../auth.service';
import { AuthProto, UsersProto } from '@app/proto';
import { of, throwError } from 'rxjs';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersProto.UsersServiceClient>;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUsersClient = {
    getService: jest.fn(),
  };

  const mockConfigService = {
    getOrThrow: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    usersService = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
      updateUser: jest.fn(),
    } as any;

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
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);

    // Common config mocks
    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const config = {
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
      (usersService.createUser as jest.Mock).mockReturnValue(of(mockNewUser));

      const result = await service.register(mockCreateUserDto);

      expect(result.$type).toBe('api.auth.AuthResponse');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.expiresAccessToken).toBeDefined();
      expect(result.expiresRefreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException when user creation fails', async () => {
      (usersService.createUser as jest.Mock).mockReturnValue(
        throwError(() => new Error('Creation failed')),
      );

      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        'User registration failed',
      );
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
      (usersService.updateUser as jest.Mock).mockReturnValue(of({}));
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
      (usersService.updateUser as jest.Mock).mockReturnValue(of({}));
    });

    it('should successfully refresh tokens', async () => {
      const result = await service.refreshToken(mockUser);

      expect(result.$type).toBe('api.auth.AuthResponse');
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.expiresAccessToken).toBeDefined();
      expect(result.expiresRefreshToken).toBeDefined();

      // Verify user update was called
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
      (usersService.getUserByEmail as jest.Mock).mockReturnValue(of(mockUser));
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
      (usersService.getUserByEmail as jest.Mock).mockReturnValue(of(mockUser));
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyUserRefreshToken(mockRefreshToken, mockEmail),
      ).rejects.toThrow(RpcException);
    });

    it('should throw RpcException when user has no refresh token', async () => {
      const userWithoutToken = { ...mockUser, refreshToken: null };
      (usersService.getUserByEmail as jest.Mock).mockReturnValue(
        of(userWithoutToken),
      );

      await expect(
        service.verifyUserRefreshToken(mockRefreshToken, mockEmail),
      ).rejects.toThrow(RpcException);
    });
  });
});
