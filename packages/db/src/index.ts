import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

import { serverEnv } from "@starter/env/server";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  db: NodePgDatabase<typeof schema> | undefined;
};

const db =
  globalForDb.db ??
  drizzle({
    connection: {
      connectionString: serverEnv.DATABASE_URL,
      max: 100,
    },
    schema,
  });

if (serverEnv.NODE_ENV !== "production") {
  globalForDb.db = db;
}

export { db };

export * from "drizzle-orm";
