# API Agent Instructions

These rules apply to `packages/api`. They are intentionally stricter than the README.

## Authority

- Official oRPC docs are the authority for oRPC behavior. Start with:
  - https://orpc.dev/llms.txt
  - https://orpc.dev/docs/contract-first/define-contract
  - https://orpc.dev/docs/contract-first/implement-contract
  - https://orpc.dev/docs/context
  - https://orpc.dev/docs/middleware
  - https://orpc.dev/docs/error-handling
  - https://orpc.dev/docs/openapi/input-output-structure
  - https://orpc.dev/docs/rpc-handler
  - https://orpc.dev/docs/openapi/openapi-handler
  - https://orpc.dev/docs/integrations/tanstack-query
- Do not copy another application's oRPC layout blindly. Use sibling repositories only as examples to
  compare against official docs and this package's goals.

## Required API Shape

- Use contract-first oRPC for new domain APIs.
- Define the contract before implementation.
- Put domain contracts in `src/contract/<domain>.ts`.
- Put domain implementations in `src/router/<domain>/`.
- One route action per implementation file, for example:

```txt
src/contract/projects.ts
src/router/projects/index.ts
src/router/projects/list.ts
src/router/projects/create.ts
src/router/projects/update.ts
```

- Compose contracts in `src/contract/index.ts`.
- Compose domain routers in `src/router/<domain>/index.ts`.
- Compose the root router with the oRPC implementer's `.router(...)` API. Official oRPC docs call this
  out as required for full contract enforcement in contract-first routers.
- If the root router has not yet been converted to `.router(...)`, do not expand the mismatch
  silently. Convert it in the same change when safe, or ask before adding more domain APIs.

## Contracts

- Contracts describe API shape only: route metadata, input schemas, output schemas, and defined
  errors.
- Do not import database clients, auth runtime objects, server env, or business services into
  contract files.
- Put shared Zod schemas in `@starter/schemas` when they are reused by API contracts, frontend forms,
  or UI code.
- Keep one-off API-only schemas near the contract until reuse is real.
- Add `.route({ method, path, tags, summary, description })` metadata for OpenAPI-facing procedures.
- Prefer compact input/output structures. Use `inputStructure: "detailed"` or
  `outputStructure: "detailed"` only when a route truly needs separate params/query/body/headers,
  custom response headers, or multiple success statuses.
- Default outputs should be direct typed objects, not `{ body: ... }` wrappers.

## Procedures And Middleware

- Use shared procedure bases from `src/lib/procedures.ts`.
- Use `publicProcedure` only for endpoints that must be callable without a session.
- Use `protectedProcedure` for session-required endpoints.
- Add domain-specific middleware for tenant, role, billing, or ownership requirements. Do not repeat
  those checks inline across handlers.
- Middleware should inject or narrow context. Handlers should receive already-validated session,
  user, tenant, permission, and dependency context where practical.
- Prefer `context.db` for data access in new data routes. If a procedure base does not inject the DB
  yet, add or use a DB middleware instead of importing the singleton everywhere.
- Keep handler files thin enough to audit: validate ownership, call domain query/mutation helpers,
  map results to the contract output, and throw typed errors.

## Data And Authorization

- Never trust organization, tenant, account, or user IDs from input for authorization decisions.
- Scope organization-owned queries from authenticated context.
- Scope user-owned queries from authenticated context.
- Validate resource ownership in the same database operation where practical.
- Mutations that touch multiple tables must use a transaction.
- For list endpoints, whitelist filter and sort keys. Never pass arbitrary input field names into SQL
  order clauses.
- Standard list outputs must use one of these envelopes:

```ts
// Cursor pagination, preferred for growing feeds and APIs.
{ items: TItem[]; nextCursor: string | null }

// Offset pagination, allowed for data grids that need total counts.
{ items: TItem[]; total: number; page: number; pageSize: number }
```

## Errors

- Throw `ORPCError` for expected failures such as `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
  `CONFLICT`, and `UNPROCESSABLE_CONTENT`.
- Do not put secrets, tokens, connection strings, raw SQL, or sensitive records in `ORPCError.data`.
- Re-throw existing `ORPCError` instances. Convert unexpected errors to `INTERNAL_SERVER_ERROR` after
  logging through the established logging/Sentry path.
- Do not throw literals. Throw `Error` or `ORPCError` instances.
- Prefer type-safe `.errors(...)` definitions when clients need to branch on structured error data.

## Client And Handler Boundaries

- `/rpc` is for oRPC `RPCLink`. Do not write frontend code that hand-crafts requests to RPC protocol
  endpoints.
- `/api` is for OpenAPI/REST exposure through `OpenAPIHandler`.
- Frontend TanStack Query usage should go through `createTanstackQueryUtils(...)` helpers such as
  `orpc.projects.list.queryOptions(...)` and `orpc.projects.create.mutationOptions(...)`.
- If cookie auth is used cross-origin, keep oRPC CSRF protections in mind. `RPCHandler` enables strict
  GET handling by default; use the official CSRF plugin only as a deliberate alternative.

## Tests

- Add focused tests for:
  - contract input and output validation,
  - auth and tenant scoping,
  - permission middleware,
  - pagination/filter/sort behavior,
  - transaction-heavy mutations,
  - error mapping clients depend on.
- Prefer direct procedure/server-side client tests for route behavior. Use fetch-level tests only when
  handler, CORS, headers, cookies, or OpenAPI behavior matters.

## Anti-Patterns

- Do not add product mutations in frontend server functions.
- Do not import `apps/web` or browser-only modules into `packages/api`.
- Do not build auth, callback, RPC, or API URLs by string concatenation in feature code.
- Do not introduce `any` to bypass router or schema typing.
- Do not create generic `utils.ts` dumping grounds for domain behavior.
