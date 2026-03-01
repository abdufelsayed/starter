import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  lastLoginMethodClient,
  organizationClient,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { webEnv } from "@starter/env/web";

type FetchOptions = NonNullable<Parameters<typeof createAuthClient>[0]>["fetchOptions"];

export function createBetterAuthClient(fetchOptions?: FetchOptions) {
  return createAuthClient({
    baseURL: webEnv.VITE_SERVER_URL,
    basePath: "/api/auth",
    fetchOptions,
    plugins: [
      adminClient(),
      twoFactorClient(),
      magicLinkClient(),
      stripeClient({
        subscription: true,
      }),
      lastLoginMethodClient(),
      organizationClient(),
    ],
  });
}

export type BetterAuthClient = ReturnType<typeof createBetterAuthClient>;
