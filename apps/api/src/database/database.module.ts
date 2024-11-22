import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION, DatabaseType } from './database-connection';
import { ConfigService } from '@nestjs/config';
import { database } from '@repo/database';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService): DatabaseType => {
        return database;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
