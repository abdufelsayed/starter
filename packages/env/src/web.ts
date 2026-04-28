/// <reference types="vite/client" />
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { onValidationError, sharedEnv } from "./shared";

const defaultApiUrl = "http://localhost:8080";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function toUrl(baseUrl: string, path: `/${string}`): string {
  return new URL(path, `${baseUrl}/`).toString();
}

export const webEnv = createEnv({
  client: {
    VITE_SENTRY_DSN: z.url(),
    VITE_APP_VERSION: z.string().default("dev"),
    VITE_WEB_URL: z.url().default("http://localhost:3000"),
    VITE_API_URL: z.url().optional(),
    VITE_SERVER_URL: z.url().optional(),
  },

  clientPrefix: "VITE_",
  emptyStringAsUndefined: true,

  extends: [sharedEnv],
  isServer: typeof window === "undefined",
  onValidationError,
  runtimeEnv: import.meta.env,
  server: {
    AXIOM_DATASET: z.string().default("axiom-dataset"),
    OTEL_SERVICE_NAME: z.string().default("otel-service-name"),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || !!process.env.CI,
});

const appUrl = normalizeBaseUrl(webEnv.VITE_WEB_URL);
const apiUrl = normalizeBaseUrl(webEnv.VITE_API_URL ?? webEnv.VITE_SERVER_URL ?? defaultApiUrl);

export const webUrls = {
  api: apiUrl,
  app: appUrl,
  auth: toUrl(apiUrl, "/api/auth").replace(/\/+$/, ""),
  rpc: toUrl(apiUrl, "/rpc").replace(/\/+$/, ""),
  apiPath: (path: `/${string}`) => toUrl(apiUrl, path),
  appPath: (path: `/${string}`) => toUrl(appUrl, path),
};
