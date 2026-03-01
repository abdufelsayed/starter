import { createAccountModule } from "./account";
import { createAdminModule } from "./admin";
import { createBillingModule } from "./billing";
import { createBetterAuthClient, type BetterAuthClient } from "./client";
import { createOrganizationModule } from "./organization";
import { createSessionModule } from "./session";
import { createTwoFactorModule } from "./two-factor";

type FetchOptions = Parameters<typeof createBetterAuthClient>[0];

export function createAuthClient(fetchOptions?: FetchOptions) {
  const client = createBetterAuthClient(fetchOptions);

  return {
    session: createSessionModule(client),
    account: createAccountModule(client),
    billing: createBillingModule(client),
    twoFactor: createTwoFactorModule(client),
    admin: createAdminModule(client),
    organization: createOrganizationModule(client),
  } as const;
}

export type { BetterAuthClient };
