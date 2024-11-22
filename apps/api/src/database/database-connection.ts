import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { DatabaseSchemas } from '@repo/database/schema';

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');
export type DatabaseType = NeonHttpDatabase<DatabaseSchemas>;
