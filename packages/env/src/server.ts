import { createEnv } from "@t3-oss/env-core";
import { fly } from "@t3-oss/env-core/presets-zod";
import { z } from "zod";

import { onValidationError, sharedEnv } from "./shared";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function toUrl(baseUrl: string, path: `/${string}`): string {
  return new URL(path, `${baseUrl}/`).toString();
}

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,

  extends: [sharedEnv, fly()],
  onValidationError,
  runtimeEnv: process.env,
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
    API_URL: z.url().optional(),
    SERVER_URL: z.url().optional(),
    WEB_APP_URL: z.url().default("http://localhost:3000"),

    // OAuth
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),

    // Email
    RESEND_API_KEY: z.string().min(1),

    // Better Auth
    BETTER_AUTH_SECRET: z.string().min(32),

    // Payments
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRO_PRICE_ID: z.string().min(1),
    STRIPE_PRO_ANNUAL_PRICE_ID: z.string().min(1),
    STRIPE_MAX_PRICE_ID: z.string().min(1),
    STRIPE_MAX_ANNUAL_PRICE_ID: z.string().min(1),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || !!process.env.CI,
});

const apiUrl = normalizeBaseUrl(
  serverEnv.API_URL ?? serverEnv.SERVER_URL ?? `http://localhost:${serverEnv.PORT}`,
);
const appUrl = normalizeBaseUrl(serverEnv.WEB_APP_URL);

export const serverUrls = {
  api: apiUrl,
  app: appUrl,
  auth: toUrl(apiUrl, "/api/auth").replace(/\/+$/, ""),
  rpc: toUrl(apiUrl, "/rpc").replace(/\/+$/, ""),
  apiPath: (path: `/${string}`) => toUrl(apiUrl, path),
  appPath: (path: `/${string}`) => toUrl(appUrl, path),
};
