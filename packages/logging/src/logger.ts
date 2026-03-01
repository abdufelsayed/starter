import { context, trace } from "@opentelemetry/api";
import pino, { type Logger, type LoggerOptions } from "pino";

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
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    };
  }
  return {};
};

export function createLogger(config: LoggerConfig): Logger {
  const isDevelopment = config.environment === "development";

  const baseOptions: LoggerOptions = {
    level: config.level,
    mixin: otelMixin,
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      service: config.service,
      version: config.version,
      env: config.environment,
    },
  };

  if (isDevelopment) {
    return pino({
      ...baseOptions,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: false,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    });
  }

  const targets: pino.TransportTargetOptions[] = [
    { target: "pino/file", options: { destination: 1 } },
  ];

  if (config.axiom) {
    targets.push({
      target: "@axiomhq/pino",
      options: {
        dataset: config.axiom.dataset,
        token: config.axiom.token,
      },
    });
  }

  return pino({
    ...baseOptions,
    transport: { targets },
  });
}
