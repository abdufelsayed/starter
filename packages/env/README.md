# @starter/env

Type-safe environment variable configuration.

This README is explanatory. The strict implementation contract for agents is
[`packages/env/AGENTS.md`](./AGENTS.md).

## Stack

- [t3-env](https://env.t3.gg) - Runtime-validated environment variables
- [Zod](https://zod.dev) - Schema validation

## Exports

```ts
import { serverEnv, serverUrls } from "@starter/env/server"; // Server environment and URLs
import { webEnv, webUrls } from "@starter/env/web"; // Web environment and URLs
```

Use `API_URL` on the server and `VITE_API_URL` in the web app for the backend origin.
`SERVER_URL` and `VITE_SERVER_URL` are accepted as compatibility fallbacks.

Do not hand-build auth, RPC, API, billing callback, or app callback URLs in feature code. Use
`serverUrls` from `@starter/env/server` and `webUrls` from `@starter/env/web`.
