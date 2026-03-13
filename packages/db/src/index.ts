import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import { serverEnv } from "@starter/env/server";

import * as schema from "./schema";

declare global {
  var __db: NodePgDatabase<typeof schema> | undefined;
}

const db =
  globalThis.__db ??
  drizzle({
    connection: {
      connectionString: serverEnv.DATABASE_URL,
      max: 100,
    },
    schema,
  });

if (serverEnv.NODE_ENV !== "production") {
  globalThis.__db = db;
}

export { db };

export * from "drizzle-orm";
