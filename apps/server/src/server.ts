import { serve } from "h3";

import { serverEnv, serverUrls } from "@starter/env/server";

import { app } from "./index";
import { logger } from "./lib/logger";

logger.info(`Starting server on port ${serverEnv.PORT}...`);

serve(app, {
  port: parseInt(serverEnv.PORT, 10),
});

logger.info("Server started");
logger.info(`Server: ${serverUrls.api}`);
logger.info(`API Reference: ${serverUrls.apiPath("/api/reference")}`);
