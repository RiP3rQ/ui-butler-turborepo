import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DrizzleDatabase, mergedSchemas } from './merged-schemas';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: DrizzleDatabase;

  constructor(private configService: ConfigService) {
    this.pool = new Pool({
      connectionString: this.configService.getOrThrow('DATABASE_URL'),
    });
    this.db = drizzle(this.pool, { schema: mergedSchemas });
  }

  async onModuleInit() {
    // Test the connection
    try {
      await this.pool.connect();
      console.log('Database connection established');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
