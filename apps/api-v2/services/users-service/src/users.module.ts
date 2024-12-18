import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../libs/database/src/database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { users } from '../../../libs/database/src/schemas/users';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule.forRoot({
      DATABASE_URL: process.env.DATABASE_URL!,
    }),
    DatabaseModule.forFeature(users),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
