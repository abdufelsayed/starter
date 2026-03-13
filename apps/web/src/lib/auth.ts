import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { createAuthClient, AuthClient } from "@starter/auth/react";

const getAuthClient = createIsomorphicFn()
  .server(
    (): AuthClient =>
      createAuthClient({
        headers: getRequestHeaders(),
      }),
  )
  .client(
    (): AuthClient =>
      createAuthClient({
        credentials: "include",
      }),
  );

// On the client, cache the singleton (browser handles cookies automatically).
// On the server, create a fresh client per access so getRequestHeaders() returns
// the current request's cookies instead of stale ones from module load time.
let _cached: AuthClient | undefined;

const authClientTarget = createAuthClient({
  credentials: "include",
});

export const authClient = new Proxy(authClientTarget, {
  get(_, prop, receiver) {
    if (typeof window !== "undefined") {
      _cached ??= getAuthClient();
      return Reflect.get(_cached, prop, receiver);
    }
    return Reflect.get(getAuthClient(), prop, receiver);
  },
});
