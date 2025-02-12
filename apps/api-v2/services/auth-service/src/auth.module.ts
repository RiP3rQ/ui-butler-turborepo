import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import Joi from 'joi';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        AUTH_SERVICE_HOST: Joi.string().required(),
        AUTH_SERVICE_PORT: Joi.number().required(),

        USERS_SERVICE_HOST: Joi.string().required(),
        USERS_SERVICE_PORT: Joi.number().required(),

        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_MS: Joi.number().required(),

        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_MS: Joi.number().required(),

        GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_AUTH_REDIRECT_URI: Joi.string().required(),

        GITHUB_AUTH_CLIENT_ID: Joi.string().required(),
        GITHUB_AUTH_CLIENT_SECRET: Joi.string().required(),
        GITHUB_AUTH_REDIRECT_URI: Joi.string().required(),

        AUTH_UI_REDIRECT: Joi.string().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: `${String(configService.get('USERS_SERVICE_HOST'))}:${String(configService.get('USERS_SERVICE_PORT'))}`,
            package: 'api.users',
            protoPath: join(
              __dirname,
              '../../../libs/proto/src/proto/users.proto',
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    JwtModule.registerAsync({
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
