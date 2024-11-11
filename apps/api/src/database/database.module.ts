import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from './database-connection';
import { ConfigService } from '@nestjs/config';
import * as userSchema from '../users/schema';
import * as analyticsSchema from '../analytics/schema';
import * as credentialsSchema from '../credentials/schema';
import * as workflowExecutionsSchema from '../workflow-executions/schema';
import * as workflowsSchema from '../workflows/schema';
import { Pool } from 'pg';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow('DATABASE_URL'),
        });
        return drizzle(pool, {
          schema: {
            ...userSchema,
            ...analyticsSchema,
            ...credentialsSchema,
            ...workflowExecutionsSchema,
            ...workflowsSchema,
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
