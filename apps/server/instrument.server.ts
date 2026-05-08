import { NodeSDK } from "@opentelemetry/sdk-node";
import { ORPCInstrumentation } from "@orpc/otel";
import * as Sentry from "@sentry/node";

import { serverEnv } from "@starter/env/server";
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
    endpoint: serverEnv.AXIOM_ENDPOINT,
    token: serverEnv.AXIOM_TOKEN,
    dataset: serverEnv.AXIOM_DATASET,
  },
  environment: serverEnv.NODE_ENV,
  serviceName: serverEnv.OTEL_SERVICE_NAME,
  serviceVersion: serverEnv.OTEL_SERVICE_VERSION,
};

const spanProcessor = hasUsableAxiomConfig(otelConfig)
  ? createBatchSpanProcessor(createAxiomExporter(otelConfig))
  : undefined;

const sdk = new NodeSDK({
  instrumentations: [new ORPCInstrumentation()],
  resource: createOtelResource(otelConfig),
  sampler: createTraceSampler(serverEnv.NODE_ENV),
  spanProcessors: spanProcessor ? [spanProcessor] : [],
});

sdk.start();

logger.info(`OpenTelemetry initialized for ${serverEnv.OTEL_SERVICE_NAME}`);
if (spanProcessor) {
  logger.info(`Exporting traces to Axiom dataset: ${serverEnv.AXIOM_DATASET}`);
} else {
  logger.warn("Axiom exporter disabled until real credentials are configured");
}

// =============================================================================
// Sentry Initialization
// =============================================================================

if (hasUsableSentryDsn(serverEnv.SENTRY_DSN)) {
  Sentry.init({
    dsn: serverEnv.SENTRY_DSN,
    environment: serverEnv.NODE_ENV,
    release: serverEnv.OTEL_SERVICE_VERSION,
    sendDefaultPii: true,
    skipOpenTelemetrySetup: true,
    tracesSampleRate: serverEnv.NODE_ENV === "production" ? 0.1 : 1,
  });

  logger.info(`Sentry initialized for ${serverEnv.NODE_ENV}`);
} else {
  logger.warn("Sentry disabled until a real DSN is configured");
}

// =============================================================================
// Error Handling & Graceful Shutdown
// =============================================================================

setupUncaughtErrorHandling(logger, Sentry);
setupGracefulShutdown(logger, sdk, Sentry);
