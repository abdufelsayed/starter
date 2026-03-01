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
        serverFn,
        res: { status: "ok" },
        responseTime,
      },
      "server function completed",
    );

    return result;
  } catch (error) {
    const responseTime = Math.round(performance.now() - start);

    logger.error(
      {
        serverFn: { ...serverFn },
        res: { status: "error" },
        responseTime,
        err:
          error instanceof Error
            ? { type: error.name, message: error.message, stack: error.stack }
            : { type: "UnknownError", message: String(error) },
      },
      "server function failed",
    );

    throw error;
  }
});
