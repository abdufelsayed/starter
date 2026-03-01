import { serverEnv } from "@starter/env/server";
import { createLogger } from "@starter/logging";

export const logger = createLogger({
  level: serverEnv.LOG_LEVEL,
  service: serverEnv.OTEL_SERVICE_NAME,
  version: serverEnv.OTEL_SERVICE_VERSION,
  environment: serverEnv.NODE_ENV,
  axiom: {
    dataset: serverEnv.AXIOM_DATASET,
    token: serverEnv.AXIOM_TOKEN,
  },
});
