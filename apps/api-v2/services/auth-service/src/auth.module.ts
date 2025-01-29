import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import Joi from 'joi';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ENV_VARS } from './constants';

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
    // @ts-expect-error - In Nest v11 the type of the options is not correct
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: `${String(configService.get(ENV_VARS.USERS_SERVICE.HOST))}:${String(configService.get(ENV_VARS.USERS_SERVICE.PORT))}`,
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
