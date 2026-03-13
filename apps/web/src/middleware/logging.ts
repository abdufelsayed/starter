import { createMiddleware } from "@tanstack/react-start";

import { logger } from "@/lib/logger";

export const loggingMiddleware = createMiddleware().server(async ({ next, serverFnMeta }) => {
  const fnName = serverFnMeta?.name ?? serverFnMeta?.id ?? "unknown";

  const serverFn = {
    method: "POST" as const,
    name: fnName,
  };

  logger.debug({ serverFn }, "server function invoked");

  const start = performance.now();
  try {
    const result = await next();
    const responseTime = Math.round(performance.now() - start);

    logger.info(
      {
        res: { status: "ok" },
        responseTime,
        serverFn,
      },
      "server function completed",
    );

    return result;
  } catch (error) {
    const responseTime = Math.round(performance.now() - start);

    logger.error(
      {
        err:
          error instanceof Error
            ? { type: error.name, message: error.message, stack: error.stack }
            : { type: "UnknownError", message: String(error) },
        res: { status: "error" },
        responseTime,
        serverFn: { ...serverFn },
      },
      "server function failed",
    );

    throw error;
  }
});
