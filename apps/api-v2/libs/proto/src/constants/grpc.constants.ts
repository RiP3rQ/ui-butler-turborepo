export const GRPC_PACKAGE_NAME = "api";

export const GRPC_DEFAULT_OPTIONS = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  maxReceiveMessageLength: 1024 * 1024 * 10, // 10MB
  maxSendMessageLength: 1024 * 1024 * 10,
};

export const GRPC_SERVICES = {
  ANALYTICS: "AnalyticsService",
  AUTH: "AuthService",
  BILLING: "BillingService",
  COMPONENTS: "ComponentsService",
  EXECUTION: "ExecutionService",
  PROJECTS: "ProjectsService",
  USERS: "UsersService",
  WORKFLOWS: "WorkflowsService",
} as const;
