import { SpanStatusCode, trace } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor, TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-base";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import type { Logger } from "pino";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OtelConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  axiom: {
    endpoint: string;
    token: string;
    dataset: string;
  };
}

export interface Shutdownable {
  shutdown(): Promise<void>;
}

export interface SentryLike {
  captureException(error: unknown, hint?: { tags?: Record<string, string> }): void;
  close(timeout?: number): PromiseLike<boolean>;
}

// ---------------------------------------------------------------------------
// OTel Factories
// ---------------------------------------------------------------------------

export function createOtelResource(config: OtelConfig) {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.serviceName,
    [ATTR_SERVICE_VERSION]: config.serviceVersion,
    "deployment.environment": config.environment,
  });
}

export function createAxiomExporter(config: OtelConfig) {
  return new OTLPTraceExporter({
    url: `${config.axiom.endpoint}/v1/traces`,
    headers: {
      Authorization: `Bearer ${config.axiom.token}`,
      "X-Axiom-Dataset": config.axiom.dataset,
    },
  });
}

export function createTraceSampler(environment: string) {
  return new TraceIdRatioBasedSampler(environment === "production" ? 0.1 : 1.0);
}

export function createBatchSpanProcessor(exporter: OTLPTraceExporter) {
  return new BatchSpanProcessor(exporter);
}

// ---------------------------------------------------------------------------
// Error Handling & Shutdown
// ---------------------------------------------------------------------------

export function setupUncaughtErrorHandling(logger: Logger, sentry: SentryLike): void {
  const tracer = trace.getTracer("uncaught-errors");

  function recordError(eventName: string, reason: unknown): void {
    const span = tracer.startSpan(eventName);
    const message = String(reason);

    if (reason instanceof Error) {
      span.recordException(reason);
    } else {
      span.recordException({ message });
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message });
    span.end();

    sentry.captureException(reason, { tags: { type: eventName } });
  }

  process.on("uncaughtException", (error: Error) => {
    logger.error({ err: error }, "Uncaught exception");
    recordError("uncaughtException", error);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logger.error({ err: reason }, "Unhandled rejection");
    recordError("unhandledRejection", reason);
  });
}

export function setupGracefulShutdown(logger: Logger, sdk: Shutdownable, sentry: SentryLike): void {
  async function shutdown(): Promise<void> {
    logger.info("Graceful shutdown initiated...");

    try {
      await sdk.shutdown();
      logger.info("OpenTelemetry shutdown complete");

      await sentry.close(2000);
      logger.info("Sentry shutdown complete");
    } catch (error) {
      logger.error({ err: error }, "Error during shutdown");
    }

    process.exit(0);
  }

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
