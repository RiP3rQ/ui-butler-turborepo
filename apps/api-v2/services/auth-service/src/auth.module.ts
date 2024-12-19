import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        USERS_SERVICE_HOST: Joi.string().default('localhost'),
        USERS_SERVICE_PORT: Joi.number().default(3341),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow('USERS_SERVICE_HOST'),
            port: configService.getOrThrow('USERS_SERVICE_PORT'),
            retryAttempts: 5,
            retryDelay: 1000,
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.getOrThrow('AUTH_SERVICE_HOST', 'localhost'),
            port: configService.getOrThrow('AUTH_SERVICE_PORT', 3340),
            retryAttempts: 5,
            retryDelay: 1000,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: Math.floor(
            configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_MS') / 1000,
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
