import * as userSchema from "./schemas/users";
import * as analyticsSchema from "./schemas/analytics";
import * as credentialsSchema from "./schemas/credentials";
import * as workflowExecutionsSchema from "./schemas/workflow-executions";
import * as workflowsSchema from "./schemas/workflows";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export const databaseSchema = {
  ...userSchema,
  ...analyticsSchema,
  ...credentialsSchema,
  ...workflowExecutionsSchema,
  ...workflowsSchema,
};
export type DatabaseSchemas = typeof databaseSchema;
export type DrizzleDatabase = NodePgDatabase<DatabaseSchemas>;
