import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { createAuthClient } from "@starter/auth/react";

const getAuthClient = createIsomorphicFn()
  .server(() =>
    createAuthClient({
      headers: getRequestHeaders(),
    }),
  )
  .client(() =>
    createAuthClient({
      credentials: "include",
    }),
  );

export const authClient = getAuthClient();
