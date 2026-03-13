import { createEnv } from "@t3-oss/env-core";
import type { StandardSchemaV1 } from "@t3-oss/env-core";
import { z } from "zod";

function formatIssuePath(path: readonly unknown[] | undefined): string {
  if (!path || path.length === 0) return "<root>";

  return path
    .map((segment) => {
      if (typeof segment === "string" || typeof segment === "number") {
        return String(segment);
      }
      if (typeof segment === "symbol") {
        return segment.description ?? "<symbol>";
      }
      return "<unknown>";
    })
    .join(".");
}

export const onValidationError = (issues: readonly StandardSchemaV1.Issue[]) => {
  console.error("❌ Invalid environment variables:");
  for (const issue of issues) {
    console.error(`  - ${formatIssuePath(issue.path)}: ${issue.message}`);
  }
  throw new Error("Invalid environment variables");
};

export const sharedEnv = createEnv({
  emptyStringAsUndefined: true,
  onValidationError,
  runtimeEnv: process.env,
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

    // Observability
    AXIOM_TOKEN: z.string().min(1),
    AXIOM_ENDPOINT: z.url().default("https://api.axiom.co"),
    OTEL_SERVICE_VERSION: z.string().default("1.0.0"),
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || !!process.env.CI,
});
