import * as userSchema from "./users";
import * as billingSchema from "./billing";
import * as credentialsSchema from "./credentials";
import * as workflowExecutionsSchema from "./workflow-executions";
import * as workflowsSchema from "./workflows";
import * as projectsSchema from "./projects";
import * as componentsSchema from "./components";

export const mergedSchemas = {
  ...userSchema,
  ...billingSchema,
  ...credentialsSchema,
  ...workflowExecutionsSchema,
  ...workflowsSchema,
  ...projectsSchema,
  ...componentsSchema,
};
