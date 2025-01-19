import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import { type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { type mergedSchemas } from "../schemas/merged-schemas";

export type DatabaseSchemas = typeof mergedSchemas;

export type DrizzleDatabase = NodePgDatabase<DatabaseSchemas>;
export type NeonDatabaseType = NeonHttpDatabase<DatabaseSchemas>;
