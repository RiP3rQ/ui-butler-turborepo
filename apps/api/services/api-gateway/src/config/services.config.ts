export const servicesConfig = {
  auth: {
    host: process.env.AUTH_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 3340,
  },
  analytics: {
    host: process.env.USERS_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.USERS_SERVICE_PORT, 10) || 3341,
  },
  billing: {
    host: process.env.USERS_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.USERS_SERVICE_PORT, 10) || 3342,
  },
  projects: {
    host: process.env.USERS_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.USERS_SERVICE_PORT, 10) || 3343,
  },
  users: {
    host: process.env.USERS_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.USERS_SERVICE_PORT, 10) || 3344,
  },
  workflow: {
    host: process.env.USERS_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.USERS_SERVICE_PORT, 10) || 3345,
  },
  execution: {
    host: process.env.USERS_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.USERS_SERVICE_PORT, 10) || 3346,
  },
};
