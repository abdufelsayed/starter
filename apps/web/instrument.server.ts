import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import * as Sentry from "@sentry/tanstackstart-react";

import { webEnv } from "@starter/env/web";
import {
  createAxiomExporter,
  createBatchSpanProcessor,
  createOtelResource,
  createTraceSampler,
  hasUsableAxiomConfig,
  hasUsableSentryDsn,
  setupGracefulShutdown,
  setupUncaughtErrorHandling,
} from "@starter/logging/instrumentation";

import { logger } from "./src/lib/logger";

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

const spanProcessor = hasUsableAxiomConfig(otelConfig)
  ? createBatchSpanProcessor(createAxiomExporter(otelConfig))
  : undefined;

const sdk = new NodeSDK({
  instrumentations: [new HttpInstrumentation()],
  resource: createOtelResource(otelConfig),
  sampler: createTraceSampler(webEnv.NODE_ENV),
  spanProcessors: spanProcessor ? [spanProcessor] : [],
});

sdk.start();

logger.info(`OpenTelemetry initialized for ${webEnv.OTEL_SERVICE_NAME}`);
if (spanProcessor) {
  logger.info(`Exporting traces to Axiom dataset: ${webEnv.AXIOM_DATASET}`);
} else {
  logger.warn("Axiom exporter disabled until real credentials are configured");
}

// =============================================================================
// Sentry Initialization
// =============================================================================

if (hasUsableSentryDsn(webEnv.VITE_SENTRY_DSN)) {
  Sentry.init({
    dsn: webEnv.VITE_SENTRY_DSN,
    environment: webEnv.NODE_ENV,
    release: webEnv.OTEL_SERVICE_VERSION,
    sendDefaultPii: true,
    tracesSampleRate: webEnv.NODE_ENV === "production" ? 0.1 : 1,
  });

  logger.info(`Sentry initialized for ${webEnv.NODE_ENV}`);
} else {
  logger.warn("Sentry disabled until a real DSN is configured");
}

// =============================================================================
// Error Handling & Graceful Shutdown
// =============================================================================

setupUncaughtErrorHandling(logger, Sentry);
setupGracefulShutdown(logger, sdk, Sentry);
