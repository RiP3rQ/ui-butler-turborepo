import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { mergedSchemas } from "../schemas/merged-schemas";

export type DatabaseSchemas = typeof mergedSchemas;

export type DrizzleDatabase = NodePgDatabase<DatabaseSchemas>;
export type NeonDatabaseType = NeonHttpDatabase<DatabaseSchemas>;

export interface DatabaseConnection {
  pool: any;
  db: DrizzleDatabase;
}
