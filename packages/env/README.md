# @starter/env

Type-safe environment variable configuration.

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
