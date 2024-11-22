import { users } from "./schemas/users";
import { userBalance } from "./schemas/analytics";
import { userCredentials } from "./schemas/credentials";
import { workflowExecutions } from "./schemas/workflow-executions";
import { workflows } from "./schemas/workflows";

export const mergedSchemas = {
  users,
  userBalance,
  userCredentials,
  workflowExecutions,
  workflows,
} as const;

export type DatabaseSchemas = typeof mergedSchemas;
