/// <reference types="vite/client" />
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { onValidationError, sharedEnv } from "./shared";

export const webEnv = createEnv({
  server: {
    AXIOM_DATASET: z.string().default("axiom-dataset"),
    OTEL_SERVICE_NAME: z.string().default("otel-service-name"),
  },

  clientPrefix: "VITE_",
  client: {
    VITE_SENTRY_DSN: z.url(),
    VITE_APP_VERSION: z.string().default("dev"),
    VITE_WEB_URL: z.url().default("http://localhost:3000"),
    VITE_SERVER_URL: z.url().default("http://localhost:8080"),
  },

  extends: [sharedEnv],
  onValidationError,
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || !!process.env.CI,
  isServer: typeof window === "undefined",
});
