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
  serviceName: webEnv.OTEL_SERVICE_NAME,
  serviceVersion: webEnv.OTEL_SERVICE_VERSION,
  environment: webEnv.NODE_ENV,
  axiom: {
    endpoint: webEnv.AXIOM_ENDPOINT,
    token: webEnv.AXIOM_TOKEN,
    dataset: webEnv.AXIOM_DATASET,
  },
};

const exporter = createAxiomExporter(otelConfig);

const sdk = new NodeSDK({
  resource: createOtelResource(otelConfig),
  spanProcessor: createBatchSpanProcessor(exporter),
  instrumentations: [new HttpInstrumentation()],
  sampler: createTraceSampler(webEnv.NODE_ENV),
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
  tracesSampleRate: webEnv.NODE_ENV === "production" ? 0.1 : 1.0,
});

logger.info(`Sentry initialized for ${webEnv.NODE_ENV}`);

// =============================================================================
// Error Handling & Graceful Shutdown
// =============================================================================

setupUncaughtErrorHandling(logger, Sentry);
setupGracefulShutdown(logger, sdk, Sentry);
