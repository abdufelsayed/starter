# Creating oRPC API Routes

This skill covers how to create oRPC API routes in this project. Follow these conventions exactly.

## Project Structure

Routes live in `packages/api/src/router/`. Simple standalone routes (like `health.ts`, `ready.ts`) are single files. Domain-specific routes are organized as grouped directories:

```
packages/api/src/router/
  health.ts               # standalone route
  ready.ts                # standalone route
  todos/                  # grouped domain routes
    create.ts
    find.ts
    list.ts
    update.ts
    delete.ts
    index.ts              # re-exports all routes as a single object
  index.ts                # main router, registers all routes
```

## Key Imports

| Import                         | Source                 | Purpose                                                              |
| ------------------------------ | ---------------------- | -------------------------------------------------------------------- |
| `publicProcedure`              | `../../lib/procedures` | Unauthenticated routes (adjust `../` depth based on file location)   |
| `protectedProcedure`           | `../../lib/procedures` | Authenticated routes (provides `context.session` and `context.user`) |
| `Route` (type)                 | `@orpc/server`         | Type for the route definition object                                 |
| `ORPCError`                    | `@orpc/server`         | Error class for throwing typed API errors                            |
| `z`                            | `zod`                  | Schema validation                                                    |
| `db`, `eq`, `and`, `sql`, etc. | `@weldr/db`            | Database access and Drizzle ORM query helpers                        |
| `* as schema` or named tables  | `@weldr/db/schema`     | Drizzle table definitions                                            |
| Shared schemas                 | `@weldr/schemas`       | Zod schemas shared with frontend forms                               |

## Procedure Selection

- **`publicProcedure`** -- for routes that do NOT require authentication.
- **`protectedProcedure`** -- for routes that require a logged-in user. The auth middleware ensures `context.session` and `context.user` are defined (non-null). If no valid session exists, it automatically throws `ORPCError("UNAUTHORIZED")`.

Both procedures include the retry middleware (3 max attempts) and Sentry error tracking.

## Route File Template

Every route file follows this exact structure:

```typescript
import type { Route } from "@orpc/server";
import { z } from "zod";

import { protectedProcedure } from "../../lib/procedures";

const definition = {
  method: "POST", // "GET" | "POST" | "PUT" | "DELETE"
  tags: ["Todos"], // OpenAPI tag(s) for grouping in API reference
  path: "/todos", // URL path for the OpenAPI/REST handler
  successStatus: 201, // HTTP status code on success
  description: "Create a new todo item",
  summary: "Create todo",
} satisfies Route;

const inputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const outputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  createdAt: z.date(),
});

export default protectedProcedure
  .route(definition)
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input, context }) => {
    // context.user and context.session are guaranteed by protectedProcedure
    // Use db imported directly from @weldr/db
    // Return value must match outputSchema
  });
```

### Rules for the definition object

- `method`: Use appropriate HTTP verbs -- `GET` for reads, `POST` for creates, `PUT` for updates, `DELETE` for deletes.
- `tags`: An array of strings. Use the domain name in PascalCase (e.g., `["Todos"]`).
- `path`: The REST-style path. Use kebab-case. For parameterized paths, use `/{id}` syntax.
- `successStatus`: `200` for reads/updates/deletes, `201` for creates.
- `description`: A full sentence describing what the endpoint does.
- `summary`: A short label (2-4 words).

### Rules for schemas

- `inputSchema`: Define with `z.object(...)`. For GET routes that take no input, omit `.input(inputSchema)` from the chain entirely.
- `outputSchema`: Define with `z.object(...)`. Always include `.output(outputSchema)` for type safety.
- If a schema is shared with frontend forms, import it from `@weldr/schemas` instead of redefining it.

### Rules for the handler

- The handler receives a single object with `{ input, context }`.
- For `publicProcedure`: `context` has `reqHeaders`, `resHeaders`, `logger`, `retry`. The `session`, `user`, and `db` fields may be undefined.
- For `protectedProcedure`: `context` additionally guarantees `session` and `user` are defined.
- Database access: Import `db` directly from `@weldr/db` (this is the established pattern -- see `ready.ts`). Import table schemas from `@weldr/db/schema` or via the `schema` namespace.
- For errors, throw `ORPCError` from `@orpc/server`:
  ```typescript
  import { ORPCError } from "@orpc/server";
  throw new ORPCError("NOT_FOUND");
  throw new ORPCError("BAD_REQUEST", { message: "Todo not found" });
  ```

## Complete CRUD Example: Todos

Below is a full example of a `todos` route group. This assumes a `todos` table exists in `@weldr/db/schema`.

### `packages/api/src/router/todos/create.ts`

```typescript
import type { Route } from "@orpc/server";
import { z } from "zod";

import { db } from "@weldr/db";
import { todos } from "@weldr/db/schema";
import { nanoid } from "@weldr/shared/nanoid";

import { protectedProcedure } from "../../lib/procedures";

const definition = {
  method: "POST",
  tags: ["Todos"],
  path: "/todos",
  successStatus: 201,
  description: "Create a new todo item for the authenticated user",
  summary: "Create todo",
} satisfies Route;

const inputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

const outputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export default protectedProcedure
  .route(definition)
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input, context }) => {
    const [todo] = await db
      .insert(todos)
      .values({
        id: nanoid(),
        title: input.title,
        description: input.description ?? null,
        completed: false,
        userId: context.user.id,
      })
      .returning();

    return todo;
  });
```

### `packages/api/src/router/todos/find.ts`

```typescript
import { ORPCError } from "@orpc/server";
import type { Route } from "@orpc/server";
import { z } from "zod";

import { db } from "@weldr/db";
import { todos } from "@weldr/db/schema";
import { and, eq } from "@weldr/db";

import { protectedProcedure } from "../../lib/procedures";

const definition = {
  method: "GET",
  tags: ["Todos"],
  path: "/todos/{id}",
  successStatus: 200,
  description: "Get a single todo item by ID",
  summary: "Get todo",
} satisfies Route;

const inputSchema = z.object({
  id: z.string(),
});

const outputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export default protectedProcedure
  .route(definition)
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input, context }) => {
    const todo = await db.query.todos.findFirst({
      where: and(eq(todos.id, input.id), eq(todos.userId, context.user.id)),
    });

    if (!todo) {
      throw new ORPCError("NOT_FOUND", { message: "Todo not found" });
    }

    return todo;
  });
```

### `packages/api/src/router/todos/list.ts`

```typescript
import type { Route } from "@orpc/server";
import { z } from "zod";

import { db } from "@weldr/db";
import { todos } from "@weldr/db/schema";
import { eq } from "@weldr/db";

import { protectedProcedure } from "../../lib/procedures";

const definition = {
  method: "GET",
  tags: ["Todos"],
  path: "/todos",
  successStatus: 200,
  description: "List all todo items for the authenticated user",
  summary: "List todos",
} satisfies Route;

const outputSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    completed: z.boolean(),
    userId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
);

export default protectedProcedure
  .route(definition)
  .output(outputSchema)
  .handler(async ({ context }) => {
    const results = await db.query.todos.findMany({
      where: eq(todos.userId, context.user.id),
    });

    return results;
  });
```

### `packages/api/src/router/todos/update.ts`

```typescript
import { ORPCError } from "@orpc/server";
import type { Route } from "@orpc/server";
import { z } from "zod";

import { db, eq, and } from "@weldr/db";
import { todos } from "@weldr/db/schema";

import { protectedProcedure } from "../../lib/procedures";

const definition = {
  method: "PUT",
  tags: ["Todos"],
  path: "/todos/{id}",
  successStatus: 200,
  description: "Update an existing todo item",
  summary: "Update todo",
} satisfies Route;

const inputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

const outputSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.boolean(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export default protectedProcedure
  .route(definition)
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input, context }) => {
    const { id, ...updates } = input;

    const [todo] = await db
      .update(todos)
      .set(updates)
      .where(and(eq(todos.id, id), eq(todos.userId, context.user.id)))
      .returning();

    if (!todo) {
      throw new ORPCError("NOT_FOUND", { message: "Todo not found" });
    }

    return todo;
  });
```

### `packages/api/src/router/todos/delete.ts`

```typescript
import { ORPCError } from "@orpc/server";
import type { Route } from "@orpc/server";
import { z } from "zod";

import { db, eq, and } from "@weldr/db";
import { todos } from "@weldr/db/schema";

import { protectedProcedure } from "../../lib/procedures";

const definition = {
  method: "DELETE",
  tags: ["Todos"],
  path: "/todos/{id}",
  successStatus: 200,
  description: "Delete a todo item",
  summary: "Delete todo",
} satisfies Route;

const inputSchema = z.object({
  id: z.string(),
});

const outputSchema = z.object({
  id: z.string(),
});

export default protectedProcedure
  .route(definition)
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input, context }) => {
    const [deleted] = await db
      .delete(todos)
      .where(and(eq(todos.id, input.id), eq(todos.userId, context.user.id)))
      .returning({ id: todos.id });

    if (!deleted) {
      throw new ORPCError("NOT_FOUND", { message: "Todo not found" });
    }

    return deleted;
  });
```

### `packages/api/src/router/todos/index.ts`

The group index file re-exports all routes as a single object:

```typescript
import create from "./create";
import deleteTodo from "./delete";
import find from "./find";
import findMany from "./find-many";
import update from "./update";

export default { create, find, findMany, update, delete: deleteTodo };
```

Note: `delete` is a reserved word in JavaScript, so import it with an alias (e.g., `deleteTodo`) and assign it to the `delete` key in the exported object.

### `packages/api/src/router/index.ts`

Register the new group in the main router:

```typescript
import health from "./health";
import ready from "./ready";
import todos from "./todos";

export const router = {
  health,
  ready,
  todos,
};
```

## Checklist When Creating a New Route Group

1. Create the directory: `packages/api/src/router/<domain>/`
2. Create individual route files (`create.ts`, `find.ts`, `find-many.ts`, `update.ts`, `delete.ts`, or whichever subset is needed).
3. Each route file must:
   - Import `type { Route }` from `@orpc/server` and `z` from `zod`.
   - Import the appropriate procedure (`publicProcedure` or `protectedProcedure`) from `../../lib/procedures`.
   - Define `definition` as a plain object with `method`, `tags`, `path`, `successStatus`, `description`, `summary`, typed with `satisfies Route`.
   - Define `inputSchema` (if the route accepts input) and `outputSchema` using Zod.
   - Export default the procedure chain: `procedure.route(definition).input(...).output(...).handler(...)`.
4. Create `index.ts` in the group directory that imports all routes and re-exports them as a single default object.
5. Register the group in `packages/api/src/router/index.ts` by importing the group's `index.ts` and adding it to the `router` object.
6. The route is now automatically available via both the RPC handler and the OpenAPI/REST handler. No additional wiring is needed.

## Common ORPCError Codes

Use these standardized error codes when throwing `ORPCError`:

- `"BAD_REQUEST"` -- invalid input that passed schema validation but fails business logic
- `"UNAUTHORIZED"` -- missing or invalid authentication (usually handled by `protectedProcedure` automatically)
- `"FORBIDDEN"` -- authenticated but not authorized for this action
- `"NOT_FOUND"` -- requested resource does not exist
- `"CONFLICT"` -- resource already exists or state conflict
- `"INTERNAL_SERVER_ERROR"` -- unexpected server error

## Public Route Example

For routes that do not require authentication, use `publicProcedure` and omit any `context.user` / `context.session` access:

```typescript
import type { Route } from "@orpc/server";
import { z } from "zod";

import { publicProcedure } from "../../lib/procedures";

const definition = {
  method: "GET",
  tags: ["Status"],
  path: "/status",
  successStatus: 200,
  description: "Public status endpoint",
  summary: "Get status",
} satisfies Route;

const outputSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.date(),
});

export default publicProcedure
  .route(definition)
  .output(outputSchema)
  .handler(async () => {
    return {
      status: "ok",
      timestamp: new Date(),
    };
  });
```
