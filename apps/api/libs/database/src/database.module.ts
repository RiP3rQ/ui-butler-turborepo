import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseFactory } from './connections/database.factory';
import { DatabaseConfig } from './config/database.config';
import { drizzle } from 'drizzle-orm/node-postgres';

@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: () => {
            return DatabaseFactory.createConnection({
              connectionString: config.DATABASE_URL,
              schemas: {}, // Will be overridden in forFeature
            });
          },
        },
      ],
      exports: ['DATABASE_CONNECTION'],
    };
  }

  static forFeature(schemas: any): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: (connection: any) => {
            return {
              ...connection,
              db: drizzle(connection.pool, { schema: schemas }),
            };
          },
          inject: ['DATABASE_CONNECTION'],
        },
      ],
      exports: ['DATABASE_CONNECTION'],
    };
  }
}
