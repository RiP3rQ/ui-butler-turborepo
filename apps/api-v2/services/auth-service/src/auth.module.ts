import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../../../src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from '../../../src/auth/strategies/local.strategy';
import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../../../src/auth/strategies/jwt-refresh.strategy';
import { GoogleStrategy } from '../../../src/auth/strategies/google.strategy';
import { GithubStrategy } from '../../../src/auth/strategies/github.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secretKey = configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET');
        const expirationMs = parseInt(
          configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
        );
        const expirationString = `${expirationMs}ms`;

        return {
          global: true,
          secret: secretKey,
          signOptions: {
            expiresIn: expirationString,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
})
export class AuthModule {}
