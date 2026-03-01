import { createEnv, type StandardSchemaV1 } from "@t3-oss/env-core";
import { z } from "zod";

export const onValidationError = (issues: readonly StandardSchemaV1.Issue[]) => {
  console.error("❌ Invalid environment variables:");
  for (const issue of issues) {
    console.error(`  - ${issue.path?.join(".")}: ${issue.message}`);
  }
  throw new Error("Invalid environment variables");
};

export const sharedEnv = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

    // Observability
    AXIOM_TOKEN: z.string().min(1),
    AXIOM_ENDPOINT: z.url().default("https://api.axiom.co"),
    OTEL_SERVICE_VERSION: z.string().default("1.0.0"),
  },
  onValidationError,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || !!process.env.CI,
});
