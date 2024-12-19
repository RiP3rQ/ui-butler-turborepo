// connections/database.factory.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { DatabaseConnection } from "../types/database.types";

interface ConnectionOptions {
  connectionString: string;
  schemas: any;
}

export class DatabaseFactory {
  static async createConnection(
    options: ConnectionOptions,
  ): Promise<DatabaseConnection> {
    const pool = new Pool({
      connectionString: options.connectionString,
    });

    // Test the connection
    try {
      await pool.connect();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw new Error(`Failed to connect to database: ${errorMessage}`);
    }

    return {
      pool,
      db: drizzle(pool, { schema: options.schemas }),
    };
  }
}
