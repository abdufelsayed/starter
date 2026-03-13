import { NodeSDK } from "@opentelemetry/sdk-node";
import { ORPCInstrumentation } from "@orpc/otel";
import * as Sentry from "@sentry/bun";
import { logger } from "@server/lib/logger";

import { serverEnv } from "@starter/env/server";
import {
  createAxiomExporter,
  createBatchSpanProcessor,
  createOtelResource,
  createTraceSampler,
  setupGracefulShutdown,
  setupUncaughtErrorHandling,
} from "@starter/logging/instrumentation";

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

const exporter = createAxiomExporter(otelConfig);

const sdk = new NodeSDK({
  instrumentations: [new ORPCInstrumentation()],
  resource: createOtelResource(otelConfig),
  sampler: createTraceSampler(serverEnv.NODE_ENV),
  spanProcessor: createBatchSpanProcessor(exporter),
});

sdk.start();

logger.info(`OpenTelemetry initialized for ${serverEnv.OTEL_SERVICE_NAME}`);
logger.info(`Exporting traces to Axiom dataset: ${serverEnv.AXIOM_DATASET}`);

// =============================================================================
// Sentry Initialization
// =============================================================================

Sentry.init({
  dsn: serverEnv.SENTRY_DSN,
  environment: serverEnv.NODE_ENV,
  release: serverEnv.OTEL_SERVICE_VERSION,
  sendDefaultPii: true,
  tracesSampleRate: serverEnv.NODE_ENV === "production" ? 0.1 : 1,
});

logger.info(`Sentry initialized for ${serverEnv.NODE_ENV}`);

// =============================================================================
// Error Handling & Graceful Shutdown
// =============================================================================

setupUncaughtErrorHandling(logger, Sentry);
setupGracefulShutdown(logger, sdk, Sentry);
