import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { BatchLinkPlugin, DedupeRequestsPlugin } from "@orpc/client/plugins";
import { createTanstackQueryUtils, type RouterUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import type { RouterClient } from "@starter/api";
import { webUrls } from "@starter/env/web";

export type ORPCReactUtils = RouterUtils<RouterClient>;

const linkPlugins = [
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
];

const getORPCClient = createIsomorphicFn()
  .server((): RouterClient => {
    const link = new RPCLink({
      url: webUrls.rpc,
      headers: () => Object.fromEntries(getRequestHeaders().entries()),
      plugins: linkPlugins,
    });

    return createORPCClient(link);
  })
  .client((): RouterClient => {
    const link = new RPCLink({
      url: webUrls.rpc,
      fetch: (url, init) => fetch(url, { ...init, credentials: "include" }),
      plugins: linkPlugins,
    });

    return createORPCClient(link);
  });

export const api: RouterClient = getORPCClient();

export const orpc = createTanstackQueryUtils(api);
