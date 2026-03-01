import { createEnv } from "@t3-oss/env-core";
import { fly } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

import { onValidationError, sharedEnv } from "./shared";

export const serverEnv = createEnv({
  server: {
    // Server config
    PORT: z.string().default("8080"),

    // Database
    DATABASE_URL: z.url(),

    // Observability
    AXIOM_DATASET: z.string().default("axiom-dataset"),
    OTEL_SERVICE_NAME: z.string().default("otel-service-name"),
    SENTRY_DSN: z.url(),

    // CORS
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    CORS_HOST: z.string().default("http://localhost:3000"),

    // URLs
    SERVER_URL: z.url().default("http://localhost:8080"),
    WEB_APP_URL: z.url().default("http://localhost:3000"),

    // OAuth
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),

    // Email
    RESEND_API_KEY: z.string().min(1),

    // Payments
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRO_PRICE_ID: z.string().min(1),
    STRIPE_PRO_ANNUAL_PRICE_ID: z.string().min(1),
    STRIPE_MAX_PRICE_ID: z.string().min(1),
    STRIPE_MAX_ANNUAL_PRICE_ID: z.string().min(1),
  },

  extends: [sharedEnv, fly()],
  onValidationError,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || !!process.env.CI,
});
