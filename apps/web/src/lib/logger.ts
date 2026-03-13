import { webEnv } from "@starter/env/web";
import { createLogger } from "@starter/logging";

export const logger = createLogger({
  axiom: {
    dataset: webEnv.AXIOM_DATASET,
    token: webEnv.AXIOM_TOKEN,
  },
  environment: webEnv.NODE_ENV,
  level: webEnv.LOG_LEVEL,
  service: webEnv.OTEL_SERVICE_NAME,
  version: webEnv.OTEL_SERVICE_VERSION,
});
