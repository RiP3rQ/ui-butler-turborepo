import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/database/schemas',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
