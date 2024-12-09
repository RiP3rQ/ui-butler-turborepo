import * as userSchema from './schemas/users';
import * as analyticsSchema from './schemas/analytics';
import * as credentialsSchema from './schemas/credentials';
import * as workflowExecutionsSchema from './schemas/workflow-executions';
import * as workflowsSchema from './schemas/workflows';
import * as projectsSchema from './schemas/projects';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export const mergedSchemas = {
  ...userSchema,
  ...analyticsSchema,
  ...credentialsSchema,
  ...workflowExecutionsSchema,
  ...workflowsSchema,
  ...projectsSchema,
};
export type DatabaseSchemas = typeof mergedSchemas;
export type DrizzleDatabase = NodePgDatabase<DatabaseSchemas>;
