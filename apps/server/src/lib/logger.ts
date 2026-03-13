import { serverEnv } from "@starter/env/server";
import { createLogger } from "@starter/logging";

export const logger = createLogger({
  axiom: {
    dataset: serverEnv.AXIOM_DATASET,
    token: serverEnv.AXIOM_TOKEN,
  },
  environment: serverEnv.NODE_ENV,
  level: serverEnv.LOG_LEVEL,
  service: serverEnv.OTEL_SERVICE_NAME,
  version: serverEnv.OTEL_SERVICE_VERSION,
});
