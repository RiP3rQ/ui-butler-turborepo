import * as userSchema from '../users/schema';
import * as analyticsSchema from '../analytics/schema';
import * as credentialsSchema from '../credentials/schema';
import * as workflowExecutionsSchema from '../workflow-executions/schema';
import * as workflowsSchema from '../workflows/schema';

export const mergedSchemas = {
  ...userSchema,
  ...analyticsSchema,
  ...credentialsSchema,
  ...workflowExecutionsSchema,
  ...workflowsSchema,
};

export type DatabaseSchemas = typeof mergedSchemas;
