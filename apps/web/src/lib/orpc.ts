import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin, DedupeRequestsPlugin } from "@orpc/client/plugins";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RouterUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { router } from "@starter/api";
import type { RouterClient } from "@starter/api";
import { webEnv } from "@starter/env/web";

export type ORPCReactUtils = RouterUtils<RouterClient>;

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(router, {
      context: () => ({
        headers: getRequestHeaders(),
      }),
    }),
  )
  .client((): RouterClient => {
    const link = new RPCLink({
      fetch: (url, init) => fetch(url, { ...init, credentials: "include" }),
      plugins: [
        new BatchLinkPlugin({
          groups: [
            {
              condition: () => true,
              context: {},
            },
          ],
        }),
        new DedupeRequestsPlugin({
          groups: [
            {
              condition: () => true,
              context: {},
            },
          ],
        }),
      ],
      url: import.meta.env.DEV ? window.location.href : `${webEnv.VITE_SERVER_URL}/rpc`,
    });

    return createORPCClient(link);
  });

export const api: RouterClient = getORPCClient();

export const orpc = createTanstackQueryUtils(api);
