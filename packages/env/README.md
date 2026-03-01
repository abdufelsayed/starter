# @starter/env

Type-safe environment variable configuration.

## Stack

- [t3-env](https://env.t3.gg) - Runtime-validated environment variables
- [Zod](https://zod.dev) - Schema validation

## Exports

```ts
import { serverEnv } from "@starter/env/server"; // Server environment
import { webEnv } from "@starter/env/web"; // Web environment (VITE_ prefix)
```
