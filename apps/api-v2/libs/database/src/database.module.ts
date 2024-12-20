// database/src/database.module.ts
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { mergedSchemas } from "./schemas/merged-schemas";
import { DATABASE_CONNECTION } from "./constants/connection-name";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
  ],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.getOrThrow<string>("DATABASE_URL", {
          infer: true,
        });

        if (!databaseUrl) {
          throw new Error("DATABASE_URL environment variable is not set");
        }

        const pool = new Pool({
          connectionString: databaseUrl,
        });

        try {
          await pool.connect();
          console.log("Database connection established successfully");
          return drizzle(pool, { schema: mergedSchemas });
        } catch (error) {
          console.error("Failed to connect to database:", error);
          throw error;
        }
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
