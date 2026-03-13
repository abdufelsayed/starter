import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders, getResponseHeaders } from "@tanstack/react-start/server";

import { logger } from "@/lib/logger";

const REDACTED_HEADERS = new Set(["authorization", "cookie", "set-cookie"]);

function safeHeaders(headers: Record<string, string | undefined>): Record<string, string> {
  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    safe[key] = REDACTED_HEADERS.has(key.toLowerCase()) ? "[REDACTED]" : value;
  }
  return safe;
}

function toHeaderRecord(headers: unknown): Record<string, string | undefined> {
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }

  if (typeof headers !== "object" || headers === null) {
    return {};
  }

  const record: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string" || value === undefined) {
      record[key] = value;
    }
  }

  return record;
}

export const routeLoggingMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next, request, pathname }) => {
    const url = new URL(request.url);
    const reqHeaders = toHeaderRecord(getRequestHeaders());

    const req = {
      method: request.method,
      url: url.pathname + url.search,
      route: pathname,
      headers: safeHeaders(reqHeaders),
      remoteAddress: reqHeaders["x-forwarded-for"] ?? reqHeaders["x-real-ip"],
      userAgent: reqHeaders["user-agent"],
      contentType: reqHeaders["content-type"],
      contentLength: reqHeaders["content-length"]
        ? Number(reqHeaders["content-length"])
        : undefined,
      referer: reqHeaders["referer"],
    };

    logger.debug({ req }, "incoming request");

    const start = performance.now();
    try {
      const result = await next();
      const responseTime = Math.round(performance.now() - start);
      const resHeaders = toHeaderRecord(getResponseHeaders());
      const statusCode = result.response.status;

      const res = {
        statusCode,
        headers: safeHeaders(resHeaders),
        contentLength: resHeaders["content-length"]
          ? Number(resHeaders["content-length"])
          : undefined,
        contentType: resHeaders["content-type"],
      };

      const logData = { req, res, responseTime };

      if (statusCode >= 500) {
        logger.error(logData, "request completed");
      } else if (statusCode >= 400) {
        logger.warn(logData, "request completed");
      } else {
        logger.info(logData, "request completed");
      }

      return result;
    } catch (error) {
      const responseTime = Math.round(performance.now() - start);
      logger.error(
        {
          req,
          res: { statusCode: 500 },
          responseTime,
          err:
            error instanceof Error
              ? { type: error.name, message: error.message, stack: error.stack }
              : { type: "UnknownError", message: String(error) },
        },
        "request failed",
      );
      throw error;
    }
  },
);
