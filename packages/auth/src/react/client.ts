import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  lastLoginMethodClient,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";

import { webEnv } from "@starter/env/web";

import { tanstackQuery, type TanstackQueryClient } from "./tanstack-query";

type FetchOptions = NonNullable<Parameters<typeof createBetterAuthClient>[0]>["fetchOptions"];

function createBetterAuth(fetchOptions?: FetchOptions) {
  const baseURL =
    typeof window !== "undefined" && import.meta.env.DEV
      ? window.location.origin
      : webEnv.VITE_SERVER_URL;

  return createBetterAuthClient({
    baseURL,
    basePath: "/api/auth",
    fetchOptions,
    plugins: [
      adminClient(),
      twoFactorClient({
        onTwoFactorRedirect() {
          window.location.href = `${webEnv.VITE_WEB_URL}/auth/verify-2fa`;
        },
      }),
      magicLinkClient(),
      stripeClient({
        subscription: true,
      }),
      lastLoginMethodClient(),
    ],
  });
}

type BetterAuthClient = ReturnType<typeof createBetterAuth>;

export type AuthClient = TanstackQueryClient<BetterAuthClient>;

export function createAuthClient(fetchOptions?: FetchOptions): AuthClient {
  const client = createBetterAuth(fetchOptions);
  return tanstackQuery(client);
}
