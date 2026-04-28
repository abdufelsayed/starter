import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";

import { webUrls } from "@starter/env/web";

import { tanstackQuery, type TanstackQueryClient } from "./tanstack-query";

type FetchOptions = NonNullable<Parameters<typeof createBetterAuthClient>[0]>["fetchOptions"];

function getTwoFactorRedirectURL() {
  const url = new URL(webUrls.appPath("/auth/verify-2fa"));
  const current = new URL(window.location.href);
  const redirect = current.searchParams.get("redirect");

  if (redirect) {
    url.searchParams.set("redirect", redirect);
  }

  return url.toString();
}

function createBetterAuth(fetchOptions?: FetchOptions) {
  return createBetterAuthClient({
    baseURL: webUrls.api,
    basePath: "/api/auth",
    fetchOptions,
    plugins: [
      adminClient(),
      twoFactorClient({
        onTwoFactorRedirect() {
          window.location.href = getTwoFactorRedirectURL();
        },
      }),
      magicLinkClient(),
      organizationClient(),
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
