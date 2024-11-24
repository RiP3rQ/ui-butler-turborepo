import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const server: Parameters<typeof createEnv>[0]["server"] = {
  DATABASE_URL: z.string().min(1).url(),
};

const client: Parameters<typeof createEnv>[0]["client"] = {
  NEXT_PUBLIC_API_URL: z.string().min(1).url(),
};

export const env = createEnv({
  client,
  server,
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
