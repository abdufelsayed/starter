import { H3 } from "h3";

import { createHandlers } from "@starter/api";
import { auth } from "@starter/auth";
import { serverEnv, serverUrls } from "@starter/env/server";

import { logger } from "./lib/logger";

const { openApiHandler, rpcHandler, corsConfig } = createHandlers({
  apiUrl: serverUrls.api,
  corsOrigin: serverEnv.CORS_ORIGIN,
  isDevelopment: serverEnv.NODE_ENV === "development",
  logger,
  port: serverEnv.PORT,
});

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowedOrigin = origin && corsConfig.origin.includes(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Credentials": String(corsConfig.credentials),
    "Access-Control-Allow-Headers": corsConfig.allowHeaders.join(", "),
    "Access-Control-Allow-Methods": corsConfig.allowMethods.join(", "),
    "Access-Control-Max-Age": String(corsConfig.maxAge),
    Vary: "Origin",
  };

  if (isAllowedOrigin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function addCorsHeaders(response: Response, origin: string | null): Response {
  const headers = getCorsHeaders(origin);
  const newHeaders = new Headers(response.headers);

  for (const [key, value] of Object.entries(headers)) {
    newHeaders.set(key, value);
  }

  return new Response(response.body, {
    headers: newHeaders,
    status: response.status,
    statusText: response.statusText,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function isNotReadyResponse(response: Response): Promise<boolean> {
  try {
    const body: unknown = await response.clone().json();
    return isRecord(body) && body.status === "not_ready";
  } catch {
    return false;
  }
}

function withStatus(response: Response, status: number, statusText: string): Response {
  return new Response(response.body, {
    headers: response.headers,
    status,
    statusText,
  });
}

async function handleHealthRequest(request: Request): Promise<Response> {
  const result = await openApiHandler.handle(request, {
    context: {},
    prefix: "/",
  });

  if (result.matched) {
    return result.response;
  }

  return new Response("Not found", { status: 404 });
}

async function handleReadyRequest(request: Request): Promise<Response> {
  const result = await openApiHandler.handle(request, {
    context: {},
    prefix: "/",
  });

  if (result.matched) {
    if (await isNotReadyResponse(result.response)) {
      return withStatus(result.response, 503, "Service Unavailable");
    }

    return result.response;
  }

  return new Response("Not found", { status: 404 });
}

async function handleRpcRequest(request: Request): Promise<Response> {
  const result = await rpcHandler.handle(request, {
    context: {},
    prefix: "/rpc",
  });

  if (result.matched) {
    return result.response;
  }

  return new Response("Not found", { status: 404 });
}

async function handleAuthRequest(request: Request): Promise<Response> {
  const origin = request.headers.get("Origin");

  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: getCorsHeaders(origin),
      status: 204,
    });
  }

  const response = await auth.handler(request);
  return addCorsHeaders(response, origin);
}

async function handleOpenApiRequest(request: Request): Promise<Response> {
  const result = await openApiHandler.handle(request, {
    context: {},
    prefix: "/api",
  });

  if (result.matched) {
    return result.response;
  }

  return new Response("Not found", { status: 404 });
}

export const app = new H3({
  debug: serverEnv.NODE_ENV === "development",
  onError: (error, event) => {
    logger.error({ err: error, path: event.url.pathname }, "Unhandled server error");
  },
});

app.all("/health", (event) => handleHealthRequest(event.req));
app.all("/ready", (event) => handleReadyRequest(event.req));
app.all("/rpc/**", (event) => handleRpcRequest(event.req));
app.all("/api/auth/**", (event) => handleAuthRequest(event.req));
app.all("/api/**", (event) => handleOpenApiRequest(event.req));
app.all("/**", () => new Response("Not found", { status: 404 }));

export async function fetch(request: Request): Promise<Response> {
  return await app.fetch(request);
}
