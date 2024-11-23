import * as userSchema from './schemas/users';
import * as analyticsSchema from './schemas/analytics';
import * as credentialsSchema from './schemas/credentials';
import * as workflowExecutionsSchema from './schemas/workflow-executions';
import * as workflowsSchema from './schemas/workflows';

export const mergedSchemas = {
  ...userSchema,
  ...analyticsSchema,
  ...credentialsSchema,
  ...workflowExecutionsSchema,
  ...workflowsSchema,
};
export type DatabaseSchemas = typeof mergedSchemas;
