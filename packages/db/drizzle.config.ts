import { defineConfig } from "drizzle-kit";

import { serverEnv } from "@starter/env/server";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
