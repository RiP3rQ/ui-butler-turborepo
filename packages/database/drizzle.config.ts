import { defineConfig } from "drizzle-kit";
import { env } from "@repo/env";

export default defineConfig({
  schema: "./src/database/schemas",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
