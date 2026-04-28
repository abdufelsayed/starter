# @starter/api

Backend API package for oRPC contracts, implementations, middleware, and handler factories.

This README is explanatory. The strict implementation contract for agents is
[`packages/api/AGENTS.md`](./AGENTS.md).

## Official References

Use official oRPC docs as the source of truth:

- [oRPC LLM docs index](https://orpc.dev/llms.txt)
- [Define Contract](https://orpc.dev/docs/contract-first/define-contract)
- [Implement Contract](https://orpc.dev/docs/contract-first/implement-contract)
- [Context](https://orpc.dev/docs/context)
- [Middleware](https://orpc.dev/docs/middleware)
- [Error Handling](https://orpc.dev/docs/error-handling)
- [Input/Output Structure](https://orpc.dev/docs/openapi/input-output-structure)
- [RPC Handler](https://orpc.dev/docs/rpc-handler)
- [OpenAPI Handler](https://orpc.dev/docs/openapi/openapi-handler)
- [TanStack Query Integration](https://orpc.dev/docs/integrations/tanstack-query)
- [Testing & Mocking](https://orpc.dev/docs/advanced/testing-mocking)

## Design

Use a contract-first, domain-oriented API layout.

```txt
src/
  contract/
    index.ts
    projects.ts
  router/
    index.ts
    projects/
      index.ts
      list.ts
      create.ts
      update.ts
  lib/
    context.ts
    handlers.ts
    procedures.ts
  middlewares/
    auth.ts
    db.ts
```

The contract defines what the API is. The router implements how it works.

## Workflow

1. Define or update reusable Zod schemas in `@starter/schemas` when the same shape is used by API,
   forms, or UI.
2. Define the oRPC contract in `src/contract/<domain>.ts`.
3. Wire the domain contract into `src/contract/index.ts`.
4. Implement one action per file in `src/router/<domain>/`.
5. Compose the domain router in `src/router/<domain>/index.ts`.
6. Compose the root router with the oRPC implementer's `.router(...)` API.
7. Call the API from the web app through the typed oRPC/TanStack Query utilities.
8. Add focused tests for validation, auth, permissions, data scoping, and error behavior.

## Contract Example

```ts
import { oc } from "@orpc/contract";
import { z } from "zod";

import { createProjectSchema, projectSchema } from "@starter/schemas/projects";

const projectIdInput = z.object({
  id: z.string().min(1),
});

export const projectsContract = {
  list: oc
    .route({
      method: "GET",
      path: "/projects",
      tags: ["Projects"],
      summary: "List projects",
      description: "List projects visible to the current user.",
    })
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(25),
      }),
    )
    .output(
      z.object({
        items: z.array(projectSchema),
        nextCursor: z.string().nullable(),
      }),
    ),

  create: oc
    .route({
      method: "POST",
      path: "/projects",
      tags: ["Projects"],
      summary: "Create project",
      description: "Create a project for the current organization.",
      successStatus: 201,
    })
    .input(createProjectSchema)
    .output(projectSchema),

  find: oc
    .route({
      method: "GET",
      path: "/projects/{id}",
      tags: ["Projects"],
      summary: "Find project",
    })
    .input(projectIdInput)
    .output(projectSchema),
};
```

## Implementation Example

Use the procedure path that matches the contract path.

```ts
import { ORPCError } from "@orpc/server";

import { protectedProcedure } from "../../lib/procedures";

export default protectedProcedure.projects.find.handler(async ({ context, input }) => {
  const row = await context.db.query.projects.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, input.id), eq(table.organizationId, context.organizationId)),
  });

  if (!row) {
    throw new ORPCError("NOT_FOUND");
  }

  return row;
});
```

The exact context fields depend on the procedure base and middleware used by the domain. Add a domain
procedure or middleware when handlers repeatedly need the same context, such as `organizationId`,
roles, billing state, or a database client.

## Router Composition

Domain routers can be plain nested objects, but the root router should be finalized through the oRPC
implementer so the contract is enforced across the whole router.

```ts
// src/router/projects/index.ts
import create from "./create";
import find from "./find";
import list from "./list";

export const projectsRouter = {
  create,
  find,
  list,
};
```

```ts
// src/router/index.ts
import { os } from "../lib/procedures";
import { projectsRouter } from "./projects";

export const router = os.router({
  projects: projectsRouter,
});
```

## Output Shapes

Prefer compact outputs:

```ts
{ id: "project_123", name: "Starter" }
```

Use detailed outputs only when the route needs custom headers, custom success status, or explicit
REST body/status modeling:

```ts
{
  status: 201,
  headers: { "x-created-id": id },
  body: { id }
}
```

Standard list envelopes:

```ts
// Cursor pagination, preferred for growing APIs.
{ items: TItem[]; nextCursor: string | null }

// Offset pagination, for data grids that need totals.
{ items: TItem[]; total: number; page: number; pageSize: number }
```

## Errors

Use `ORPCError` for expected failures:

```ts
throw new ORPCError("UNAUTHORIZED");
throw new ORPCError("FORBIDDEN");
throw new ORPCError("NOT_FOUND");
throw new ORPCError("CONFLICT");
throw new ORPCError("UNPROCESSABLE_CONTENT", {
  message: "The project slug is already in use.",
});
```

Never put secrets or sensitive records in `ORPCError.data`; that data is sent to clients.

## Client Usage

Frontend code should use the generated oRPC/TanStack Query utilities, not hand-written fetch calls to
`/rpc`.

```ts
const query = useQuery(
  orpc.projects.list.queryOptions({
    input: { limit: 25 },
  }),
);

const mutation = useMutation(orpc.projects.create.mutationOptions());
mutation.mutate({ name: "Starter" });
```

`/rpc` is for `RPCLink`. `/api` is for OpenAPI-compatible requests through `OpenAPIHandler`.
