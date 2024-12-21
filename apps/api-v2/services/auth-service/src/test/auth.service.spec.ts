import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, TokenPayload, User } from '@app/common';
import { UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;
  let usersClient: jest.Mocked<ClientProxy>;

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

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config = {
                JWT_ACCESS_TOKEN_SECRET: 'test-access-secret',
                JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret',
                JWT_ACCESS_TOKEN_EXPIRATION_MS: '3600000',
                JWT_REFRESH_TOKEN_EXPIRATION_MS: '86400000',
                AUTH_UI_REDIRECT: 'http://localhost:3000',
              };
              return config[key];
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: 'USERS_SERVICE',
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
    usersClient = module.get('USERS_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    beforeEach(() => {
      jwtService.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken');
      usersClient.send.mockReturnValue(of({}));
    });

    it('should generate tokens and update user', async () => {
      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresAccessToken: expect.any(Date),
        expiresRefreshToken: expect.any(Date),
      });

      expect(usersClient.send).toHaveBeenCalledWith('users.update', {
        query: {
          userId: mockUser.id.toString(),
          email: mockUser.email,
        },
        data: { refreshToken: 'hashedRefreshToken' },
      });
    });

    it('should handle redirect for OAuth login', async () => {
      const result = await service.login(mockUser, true);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresAccessToken: expect.any(Date),
        expiresRefreshToken: expect.any(Date),
        redirect: true,
        redirectUrl: 'http://localhost:3000',
      });
    });
  });

  describe('register', () => {
    beforeEach(() => {
      jwtService.sign
        .mockReturnValueOnce(mockTokens.accessToken)
        .mockReturnValueOnce(mockTokens.refreshToken);
    });

    it('should register new user and return tokens', async () => {
      usersClient.send.mockReturnValue(of(mockUser));

      const result = await service.register(mockCreateUserDto);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresAccessToken: expect.any(Date),
        expiresRefreshToken: expect.any(Date),
      });

      expect(usersClient.send).toHaveBeenCalledWith(
        'users.create',
        mockCreateUserDto,
      );
    });

    it('should handle registration failure', async () => {
      // Use throwError instead of Promise
      usersClient.send.mockReturnValue(
        throwError(() => new Error('Registration failed')),
      );

      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersClient.send).toHaveBeenCalledWith(
        'users.create',
        mockCreateUserDto,
      );
    });

    it('should handle null user response', async () => {
      usersClient.send.mockReturnValue(of(null));

      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersClient.send).toHaveBeenCalledWith(
        'users.create',
        mockCreateUserDto,
      );
    });

    it('should handle undefined user response', async () => {
      usersClient.send.mockReturnValue(of(undefined));

      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersClient.send).toHaveBeenCalledWith(
        'users.create',
        mockCreateUserDto,
      );
    });

    it('should handle microservice communication error', async () => {
      usersClient.send.mockReturnValue(
        throwError(() => new Error('Communication error')),
      );

      await expect(service.register(mockCreateUserDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersClient.send).toHaveBeenCalledWith(
        'users.create',
        mockCreateUserDto,
      );
    });
  });

  describe('verifyUser', () => {
    beforeEach(() => {
      usersClient.send.mockReturnValue(of(mockUser));
    });

    it('should verify user credentials successfully', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyUser(mockUser.email, 'password123');

      expect(result).toEqual(mockUser);
      expect(usersClient.send).toHaveBeenCalledWith('users.get.by.email', {
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyUser(mockUser.email, 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      usersClient.send.mockReturnValue(of(null));

      await expect(
        service.verifyUser('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyUserRefreshToken', () => {
    const mockRefreshToken = 'valid-refresh-token';

    beforeEach(() => {
      usersClient.send.mockReturnValue(
        of({ ...mockUser, refreshToken: 'hashedRefreshToken' }),
      );
    });

    it('should verify refresh token successfully', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyUserRefreshToken(
        mockRefreshToken,
        mockUser.email,
      );

      expect(result).toEqual({
        ...mockUser,
        refreshToken: 'hashedRefreshToken',
      });
      expect(usersClient.send).toHaveBeenCalledWith('users.get.by.email', {
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyUserRefreshToken(mockRefreshToken, mockUser.email),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for missing refresh token', async () => {
      usersClient.send.mockReturnValue(of({ ...mockUser, refreshToken: null }));

      await expect(
        service.verifyUserRefreshToken(mockRefreshToken, mockUser.email),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      usersClient.send.mockReturnValue(of(null));

      await expect(
        service.verifyUserRefreshToken(
          mockRefreshToken,
          'nonexistent@example.com',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('private methods', () => {
    describe('generateTokens', () => {
      const payload: TokenPayload = {
        userId: '1',
        email: 'test@example.com',
      };

      beforeEach(() => {
        jwtService.sign
          .mockReturnValueOnce(mockTokens.accessToken)
          .mockReturnValueOnce(mockTokens.refreshToken);
      });

      it('should generate access and refresh tokens', async () => {
        const result = await (service as any).generateTokens(payload);

        expect(result).toEqual(mockTokens);
        expect(jwtService.sign).toHaveBeenCalledTimes(2);
      });
    });

    describe('getTokenExpirations', () => {
      it('should return correct expiration dates', () => {
        const result = (service as any).getTokenExpirations();

        expect(result).toEqual({
          expiresAccessToken: expect.any(Date),
          expiresRefreshToken: expect.any(Date),
        });
      });
    });
  });
});
