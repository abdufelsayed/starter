import { getLogger } from "@orpc/experimental-pino";

import { db, sql } from "@starter/db";

import { publicProcedure } from "../lib/procedures";

export default publicProcedure.ready.handler(async ({ context }) => {
  const logger = getLogger(context);

  let isReady = false;

  try {
    await db.execute(sql`SELECT 1`);
    isReady = true;
  } catch {
    logger?.error("Database is not ready");
    isReady = false;
  }

  return {
    status: isReady ? "ready" : "not_ready",
    timestamp: new Date(),
  };
});
