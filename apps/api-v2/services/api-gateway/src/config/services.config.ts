export const servicesConfig = {
  auth: {
    host: process.env.AUTH_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3340', 10),
  },
  analytics: {
    host: process.env.ANALYTICS_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.ANALYTICS_SERVICE_PORT ?? '3347', 10),
  },
  billing: {
    host: process.env.BILLING_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.BILLING_SERVICE_PORT ?? '3344', 10),
  },
  projects: {
    host: process.env.PROJECTS_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.PROJECTS_SERVICE_PORT ?? '3346', 10),
  },
  users: {
    host: process.env.USERS_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.USERS_SERVICE_PORT ?? '3341', 10),
  },
  workflow: {
    host: process.env.WORKFLOW_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.WORKFLOW_SERVICE_PORT ?? '3342', 10),
  },
  execution: {
    host: process.env.EXECUTION_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.EXECUTION_SERVICE_PORT ?? '3343', 10),
  },
  components: {
    host: process.env.COMPONENTS_SERVICE_HOST ?? 'localhost',
    port: parseInt(process.env.COMPONENTS_SERVICE_PORT ?? '3345', 10),
  },
};
