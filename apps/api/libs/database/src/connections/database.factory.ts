import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Logger } from '@nestjs/common';

export class DatabaseFactory {
  private static readonly logger = new Logger('DatabaseFactory');

  static createConnection(config: { connectionString: string; schemas: any }) {
    const pool = new Pool({
      connectionString: config.connectionString,
    });

    return {
      pool,
      db: drizzle(pool, { schema: config.schemas }),
    };
  }
}
