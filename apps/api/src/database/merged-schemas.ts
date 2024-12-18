import * as userSchema from './schemas/users';
import * as billingSchema from './schemas/billing';
import * as credentialsSchema from './schemas/credentials';
import * as workflowExecutionsSchema from './schemas/workflow-executions';
import * as workflowsSchema from './schemas/workflows';
import * as projectsSchema from './schemas/projects';
import * as componentsSchema from './schemas/components';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

export const mergedSchemas = {
  ...userSchema,
  ...billingSchema,
  ...credentialsSchema,
  ...workflowExecutionsSchema,
  ...workflowsSchema,
  ...projectsSchema,
  ...componentsSchema,
};
export type DatabaseSchemas = typeof mergedSchemas;
export type DrizzleDatabase = NodePgDatabase<DatabaseSchemas>;
export type NeonDatabaseType = NeonHttpDatabase<DatabaseSchemas>;
