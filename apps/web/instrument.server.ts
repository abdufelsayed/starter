import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import * as Sentry from "@sentry/tanstackstart-react";

import { webEnv } from "@starter/env/web";
import {
  createAxiomExporter,
  createBatchSpanProcessor,
  createOtelResource,
  createTraceSampler,
  setupGracefulShutdown,
  setupUncaughtErrorHandling,
} from "@starter/logging/instrumentation";

import { logger } from "@/lib/logger";

// =============================================================================
// OpenTelemetry SDK Setup
// =============================================================================

const otelConfig = {
  axiom: {
    endpoint: webEnv.AXIOM_ENDPOINT,
    token: webEnv.AXIOM_TOKEN,
    dataset: webEnv.AXIOM_DATASET,
  },
  environment: webEnv.NODE_ENV,
  serviceName: webEnv.OTEL_SERVICE_NAME,
  serviceVersion: webEnv.OTEL_SERVICE_VERSION,
};

const exporter = createAxiomExporter(otelConfig);

const sdk = new NodeSDK({
  instrumentations: [new HttpInstrumentation()],
  resource: createOtelResource(otelConfig),
  sampler: createTraceSampler(webEnv.NODE_ENV),
  spanProcessor: createBatchSpanProcessor(exporter),
});

sdk.start();

logger.info(`OpenTelemetry initialized for ${webEnv.OTEL_SERVICE_NAME}`);
logger.info(`Exporting traces to Axiom dataset: ${webEnv.AXIOM_DATASET}`);

// =============================================================================
// Sentry Initialization
// =============================================================================

Sentry.init({
  dsn: webEnv.VITE_SENTRY_DSN,
  environment: webEnv.NODE_ENV,
  release: webEnv.OTEL_SERVICE_VERSION,
  sendDefaultPii: true,
  tracesSampleRate: webEnv.NODE_ENV === "production" ? 0.1 : 1,
});

logger.info(`Sentry initialized for ${webEnv.NODE_ENV}`);

// =============================================================================
// Error Handling & Graceful Shutdown
// =============================================================================

setupUncaughtErrorHandling(logger, Sentry);
setupGracefulShutdown(logger, sdk, Sentry);
