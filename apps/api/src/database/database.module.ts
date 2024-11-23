import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { DATABASE_CONNECTION } from './database-connection';

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: DATABASE_CONNECTION,
      useFactory: (databaseService: DatabaseService) => databaseService.db,
      inject: [DatabaseService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
