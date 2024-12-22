import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ENV_VARS, GRPC_CONFIG } from './constants';
import { AUTH_V1_PACKAGE_NAME } from '@app/proto';
import { join } from 'path';
import Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.ts';
import { AuthService } from './auth.service.ts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        [ENV_VARS.AUTH_SERVICE.HOST]: Joi.string().default('localhost'),
        [ENV_VARS.AUTH_SERVICE.PORT]: Joi.number().default(
          ENV_VARS.AUTH_SERVICE.DEFAULT_PORT,
        ),
        [ENV_VARS.USERS_SERVICE.HOST]: Joi.string().default('localhost'),
        [ENV_VARS.USERS_SERVICE.PORT]: Joi.number().default(
          ENV_VARS.USERS_SERVICE.DEFAULT_PORT,
        ),
        [ENV_VARS.JWT.ACCESS_TOKEN_SECRET]: Joi.string().required(),
        [ENV_VARS.JWT.REFRESH_TOKEN_SECRET]: Joi.string().required(),
        [ENV_VARS.JWT.ACCESS_TOKEN_EXPIRATION_MS]: Joi.number().required(),
        [ENV_VARS.JWT.REFRESH_TOKEN_EXPIRATION_MS]: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: AUTH_V1_PACKAGE_NAME,
            protoPath: join(
              __dirname,
              '../../../libs/proto/src/auth/v1/auth.proto',
            ),
            url: `${configService.getOrThrow(ENV_VARS.USERS_SERVICE.HOST)}:${configService.getOrThrow(ENV_VARS.USERS_SERVICE.PORT)}`,
            loader: GRPC_CONFIG.LOADER_OPTIONS,
            maxReceiveMessageLength: GRPC_CONFIG.MAX_MESSAGE_SIZE,
            maxSendMessageLength: GRPC_CONFIG.MAX_MESSAGE_SIZE,
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
  providers: [
    AuthService,
    {
      provide: 'GRPC_CONFIG',
      useFactory: (configService: ConfigService) => ({
        url: `${configService.get('AUTH_SERVICE_HOST')}:${configService.get('AUTH_SERVICE_PORT')}`,
        package: AUTH_V1_PACKAGE_NAME,
        protoPath: join(
          __dirname,
          '../../../libs/proto/src/auth/v1/auth.proto',
        ),
      }),
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
