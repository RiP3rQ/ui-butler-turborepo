import { defineConfig } from "drizzle-kit";
import { env } from "@repo/env";

export default defineConfig({
  schema: "./schemas.ts",
  out: "./",
  dialect: "postgresql",
  dbCredentials: {
    url: env.databaseUrl,
  },
});
