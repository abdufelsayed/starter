import { serverEnv, serverUrls } from "@starter/env/server";

import { fetch } from ".";
import { logger } from "./lib/logger";

logger.info(`Starting server on port ${serverEnv.PORT}...`);

Bun.serve({
  development: serverEnv.NODE_ENV === "development",
  fetch,
  port: parseInt(serverEnv.PORT, 10),
});

logger.info("Server started");
logger.info(`Server: ${serverUrls.api}`);
logger.info(`API Reference: ${serverUrls.apiPath("/api/reference")}`);
