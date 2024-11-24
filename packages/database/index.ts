import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@repo/env";
import { databaseSchema } from "./schema";

const client = neon(env.DATABASE_URL);

export const database = drizzle({ client, schema: databaseSchema });
