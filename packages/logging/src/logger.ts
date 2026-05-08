import { context, trace } from "@opentelemetry/api";
import pino from "pino";
import type { Logger, LoggerOptions } from "pino";

export type { Logger } from "pino";

export interface LoggerConfig {
  level: string;
  service: string;
  version: string;
  environment: string;
  axiom?: { dataset: string; token: string };
}

const otelMixin = (): Record<string, string> => {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    return {
      spanId: spanContext.spanId,
      traceId: spanContext.traceId,
    };
  }
  return {};
};

function isPlaceholderValue(value: string): boolean {
  const normalized = value.toLowerCase();
  return normalized.includes("placeholder") || normalized.includes("example");
}

function hasUsableAxiomConfig(
  config: LoggerConfig["axiom"],
): config is NonNullable<LoggerConfig["axiom"]> {
  if (!config) return false;

  return (
    config.dataset.trim().length > 0 &&
    config.token.trim().length > 0 &&
    !isPlaceholderValue(config.dataset) &&
    !isPlaceholderValue(config.token)
  );
}

export function createLogger(config: LoggerConfig): Logger {
  const isDevelopment = config.environment === "development";

  const baseOptions: LoggerOptions = {
    base: {
      service: config.service,
      version: config.version,
      env: config.environment,
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    level: config.level,
    mixin: otelMixin,
  };

  if (isDevelopment) {
    return pino(baseOptions);
  }

  const targets: pino.TransportTargetOptions[] = [
    { options: { destination: 1 }, target: "pino/file" },
  ];

  if (hasUsableAxiomConfig(config.axiom)) {
    targets.push({
      options: {
        dataset: config.axiom.dataset,
        token: config.axiom.token,
      },
      target: "@axiomhq/pino",
    });
  }

  return pino({
    ...baseOptions,
    transport: { targets },
  });
}
