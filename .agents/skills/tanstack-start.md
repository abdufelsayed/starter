# TanStack Start — Routes, Server Functions, Middleware & More

This project uses **TanStack Start** (full-stack SSR framework) with **TanStack Router** (file-based, type-safe routing). Routes live in `apps/web/src/routes/`. The route tree is auto-generated in `apps/web/src/routeTree.gen.ts` — never edit that file manually.

---

## Import Aliases

- `@/` maps to `apps/web/src/` (e.g., `@/lib/seo`, `@/middleware/route-logging`)
- `@weldr/*` maps to monorepo packages (e.g., `@weldr/ui/components/button`, `@weldr/auth/react`)

---

## Route File Conventions

### Basic Leaf Route

Every route file MUST export `Route` using `createFileRoute` and define a **non-exported** `RouteComponent` function referenced by name.

**File:** `routes/about.tsx` → URL: `/about`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>About page</div>;
}
```

### Index Route

Use `index.tsx` for the default child route. The `createFileRoute` path string MUST include a trailing slash.

**File:** `routes/dashboard/index.tsx` → URL: `/dashboard`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Dashboard home</div>;
}
```

### Layout Route

Use `route.tsx` inside a directory to wrap all child routes. Import `Outlet` to render child content.

**File:** `routes/dashboard/route.tsx` → wraps all `/dashboard/*` routes

```typescript
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r">
        <nav>{/* sidebar navigation */}</nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
```

### Route Groups (Pathless Layout)

Use `(groupName)/` folders to group routes without adding a URL segment.

**File:** `routes/(marketing)/index.tsx` → URL: `/`
**File:** `routes/(marketing)/terms.tsx` → URL: `/terms`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(marketing)/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Marketing home page</div>;
}
```

### Dynamic Route

Use `$param` in the filename for dynamic URL segments.

**File:** `routes/dashboard/$todoId.tsx` → URL: `/dashboard/:todoId`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$todoId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { todoId } = Route.useParams();
  return <div>Todo: {todoId}</div>;
}
```

### Splat/Wildcard Route

Use `$.tsx` for catch-all routes.

**File:** `routes/files/$.tsx` → URL: `/files/*`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/files/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { _splat } = Route.useParams();
  return <div>File path: {_splat}</div>;
}
```

### Dot-Delimited Routes

Dots in filenames create nested URL segments without directories.

**File:** `routes/auth/forget-password.confirm.tsx` → URL: `/auth/forget-password/confirm`

### Route-Scoped Components

Place components used only by a route group in `-components/` folders. The `-` prefix tells TanStack Router to ignore this directory.

```
routes/
  dashboard/
    -components/
      stats-card.tsx
      todo-list.tsx
    index.tsx
    $todoId.tsx
    route.tsx
```

Import with: `import { TodoList } from "@/routes/dashboard/-components/todo-list";`

---

## Search Params

TanStack Router provides type-safe search params with validation. Use `validateSearch` with Zod schemas.

### Defining Search Params with Zod

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

const searchSchema = z.object({
  page: fallback(z.number(), 1).default(1),
  filter: fallback(z.string(), "").default(""),
  sort: fallback(z.enum(["newest", "oldest", "price"]), "newest").default("newest"),
});

export const Route = createFileRoute("/dashboard/todos/")({
  validateSearch: zodValidator(searchSchema),
  component: RouteComponent,
});
```

Use `fallback()` from `@tanstack/zod-adapter` + `.default()` so search params are optional in `<Link>` while retaining correct types. Use `.catch()` on plain Zod schemas when NOT using the adapter.

### Reading Search Params in Components

```typescript
function RouteComponent() {
  const { page, filter, sort } = Route.useSearch();

  return (
    <div>
      <p>Page: {page}, Filter: {filter}, Sort: {sort}</p>
    </div>
  );
}
```

For code-split components outside the route file:

```typescript
import { getRouteApi } from "@tanstack/react-router";

const routeApi = getRouteApi("/dashboard/todos/");

function TodoFilters() {
  const { filter, sort } = routeApi.useSearch();
  // ...
}
```

### Updating Search Params

**Via `<Link>`:**

```typescript
import { Link } from "@tanstack/react-router";

<Link
  from={Route.fullPath}
  search={(prev) => ({ ...prev, page: prev.page + 1 })}
>
  Next Page
</Link>
```

**Via `useNavigate`:**

```typescript
import { useNavigate } from "@tanstack/react-router";

const navigate = useNavigate({ from: Route.fullPath });

navigate({
  search: (prev) => ({ ...prev, page: prev.page + 1 }),
});
```

### Search Params in Loaders (loaderDeps)

Use `loaderDeps` to declare which search params the loader depends on, then access them in the loader:

```typescript
export const Route = createFileRoute("/dashboard/todos/")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter,
  }),
  loader: ({ context: { queryClient }, deps: { page, filter } }) => {
    queryClient.ensureQueryData(orpc.todos.findMany.queryOptions({ input: { page, filter } }));
  },
  component: RouteComponent,
});
```

### Search Middlewares

**Retain params across navigations:**

```typescript
import { retainSearchParams } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [retainSearchParams(["filter"])],
  },
});
```

**Strip default values from URLs:**

```typescript
import { stripSearchParams } from "@tanstack/react-router";

const defaults = { page: 1, filter: "", sort: "newest" };

export const Route = createFileRoute("/dashboard/todos/")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [stripSearchParams(defaults)],
  },
});
```

---

## Server Functions

Server functions run exclusively on the server. The build process replaces implementations with RPC stubs in client bundles.

### Creating Server Functions

```typescript
import { createServerFn } from "@tanstack/react-start";

// GET (default) — for reads
export const getDataFn = createServerFn({ method: "GET" }).handler(async () => {
  return { message: "Hello from server!" };
});

// POST — for writes/mutations
export const saveDataFn = createServerFn({ method: "POST" }).handler(async () => {
  return { success: true };
});
```

### Input Validation with Zod

```typescript
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  id: z.string(),
});

export const getUserFn = createServerFn({ method: "GET" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    // data is typed as { id: string }
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.id),
    });
    return user;
  });
```

### Server Functions with Middleware

```typescript
import { createServerFn } from "@tanstack/react-start";

import { loggingMiddleware } from "@/middleware/logging";

export const getSessionFn = createServerFn({ method: "POST" })
  .middleware([loggingMiddleware])
  .handler(async () => {
    const session = await auth.api.getSession({
      headers: getRequestHeaders(),
    });
    return session ?? null;
  });
```

### Calling from Loaders

```typescript
export const Route = createFileRoute("/dashboard/")({
  beforeLoad: async () => {
    const session = await getSessionFn();
    return { session };
  },
  component: RouteComponent,
});
```

### Calling from Components

```typescript
import { useServerFn } from "@tanstack/react-start";

function MyComponent() {
  const getData = useServerFn(getDataFn);

  const handleClick = async () => {
    const result = await getData();
  };
}
```

### Throwing Redirects and Not-Found

```typescript
import { redirect, notFound } from "@tanstack/react-router";

export const requireAuthFn = createServerFn().handler(async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw redirect({ to: "/auth/sign-in" });
  }
  return user;
});

export const getPostFn = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const post = await db.findPost(data.id);
    if (!post) {
      throw notFound();
    }
    return post;
  });
```

### Request/Response Utilities

```typescript
import {
  getRequest,
  getRequestHeader,
  getRequestHeaders,
  setResponseHeaders,
  setResponseStatus,
} from "@tanstack/react-start/server";

export const cachedDataFn = createServerFn({ method: "GET" }).handler(async () => {
  const authHeader = getRequestHeader("Authorization");

  setResponseHeaders(
    new Headers({
      "Cache-Control": "public, max-age=300",
    }),
  );

  setResponseStatus(200);
  return fetchData();
});
```

### File Organization for Server Functions

```
src/
  lib/
    auth/
      get-session-fn.ts     # createServerFn wrappers
  middleware/
    logging.ts              # Server function middleware
    route-logging.ts        # Route request middleware
```

---

## Middleware

TanStack Start has two middleware types:

### Request Middleware (Route-level)

Runs on every server request passing through the route. Use `type: "request"`.

```typescript
import { createMiddleware } from "@tanstack/react-start";

export const routeLoggingMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next, request, pathname }) => {
    const start = performance.now();
    try {
      const result = await next();
      const responseTime = Math.round(performance.now() - start);
      logger.info({ method: request.method, route: pathname, responseTime }, "request completed");
      return result;
    } catch (error) {
      logger.error({ method: request.method, route: pathname, err: error }, "request errored");
      throw error;
    }
  },
);
```

Applied via `server: { middleware: [...] }`:

```typescript
export const Route = createFileRoute("/dashboard")({
  server: { middleware: [routeLoggingMiddleware] },
  component: RouteComponent,
});
```

### Server Function Middleware

Runs on server function calls. No `type` needed (default).

```typescript
import { createMiddleware } from "@tanstack/react-start";

export const loggingMiddleware = createMiddleware().server(async ({ next, serverFnMeta }) => {
  const fnName = serverFnMeta?.name ?? serverFnMeta?.id ?? "unknown";
  const start = performance.now();
  try {
    const result = await next();
    logger.info(
      { fn: fnName, responseTime: Math.round(performance.now() - start) },
      "server function completed",
    );
    return result;
  } catch (error) {
    logger.error({ fn: fnName, err: error }, "server function errored");
    throw error;
  }
});
```

### Chaining Middleware

Compose middleware using `.middleware()`:

```typescript
const authMiddleware = createMiddleware()
  .middleware([loggingMiddleware])
  .server(async ({ next }) => {
    const user = await getUser();
    return next({ context: { user } });
  });
```

### Passing Context

```typescript
// Send context downstream
.server(async ({ next }) => {
  return next({ context: { userId: "123" } });
})

// Send context from client to server
.client(async ({ next, context }) => {
  return next({ sendContext: { workspaceId: context.workspaceId } });
})
.server(async ({ next, context }) => {
  console.log(context.workspaceId); // Available from client
  return next();
})
```

---

## Protected Routes

### Redirect unauthenticated users

```typescript
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/lib/auth/get-session-fn";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (!session) {
      throw redirect({ to: "/auth/sign-in" });
    }
    return { session };
  },
  component: RouteComponent,
});
```

### Redirect authenticated users away (auth pages)

```typescript
export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Outlet />
    </div>
  );
}
```

### Passing session to loaders and components

```typescript
export const Route = createFileRoute("/(marketing)/")({
  server: { middleware: [routeLoggingMiddleware] },
  beforeLoad: async () => {
    const session = await getSessionFn();
    return { session };
  },
  loader: async ({ context }) => {
    return { session: context.session };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = Route.useLoaderData();
  return <div>{session ? "Logged in" : "Logged out"}</div>;
}
```

---

## Data Loading

### Basic Loader with TanStack Query

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/dashboard/")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(orpc.todos.findMany.queryOptions({ input: {} }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: todos } = useQuery(orpc.todos.findMany.queryOptions({ input: {} }));
  return <div>{/* render todos */}</div>;
}
```

### Loader with Dynamic Params

```typescript
export const Route = createFileRoute("/dashboard/$todoId")({
  loader: ({ context: { queryClient }, params: { todoId } }) => {
    queryClient.ensureQueryData(orpc.todos.find.queryOptions({ input: { id: todoId } }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { todoId } = Route.useParams();
  const { data: todo } = useQuery(orpc.todos.find.queryOptions({ input: { id: todoId } }));
  return <div>{todo?.title}</div>;
}
```

### Loader with Search Params (loaderDeps)

```typescript
export const Route = createFileRoute("/dashboard/todos/")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ page: search.page, filter: search.filter }),
  loader: ({ context: { queryClient }, deps }) => {
    queryClient.ensureQueryData(orpc.todos.findMany.queryOptions({ input: deps }));
  },
  component: RouteComponent,
});
```

---

## Error Boundaries

### Route-Level Error Component

```typescript
import type { ErrorComponentProps } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$todoId")({
  errorComponent: TodoError,
  component: RouteComponent,
});

function TodoError({ error, reset }: ErrorComponentProps) {
  return (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Global Default Error Component

Configured in `router.tsx`:

```typescript
const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error, reset }) => (
    <ErrorComponent error={error} />
  ),
});
```

### Not-Found Component

```typescript
export const Route = createFileRoute("/dashboard/$todoId")({
  notFoundComponent: () => <div>Todo not found</div>,
  component: RouteComponent,
});
```

---

## Head / SEO

Use the `head` option with the `seo` utility from `@/lib/seo`.

```typescript
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      ...seo({
        title: "About Us - Weldr",
        description: "Learn more about our platform.",
        keywords: "about, team, company",
        image: "https://example.com/og-image.png",
        url: "https://example.com/about",
      }),
    ],
    links: [{ rel: "canonical", href: "https://example.com/about" }],
  }),
  component: RouteComponent,
});
```

### Dynamic Head from Loader Data

```typescript
export const Route = createFileRoute("/dashboard/$todoId")({
  loader: ({ context: { queryClient }, params: { todoId } }) => {
    return queryClient.ensureQueryData(orpc.todos.find.queryOptions({ input: { id: todoId } }));
  },
  head: ({ loaderData }) => ({
    meta: [
      ...seo({
        title: `${loaderData?.title} - Weldr`,
        description: loaderData?.description,
      }),
    ],
  }),
  component: RouteComponent,
});
```

The `seo()` utility accepts: `title` (required), `description`, `keywords`, `image`, `url`. Generates standard meta + Open Graph + Twitter Card tags.

---

## Server Routes (API Endpoints)

Create HTTP API endpoints alongside frontend routes.

**File:** `routes/api/webhooks/stripe.ts` → URL: `/api/webhooks/stripe`

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        // Process webhook...
        return Response.json({ received: true });
      },
    },
  },
});
```

### With Dynamic Params

```typescript
export const Route = createFileRoute("/api/users/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const user = await findUser(params.id);
        if (!user) return new Response("Not found", { status: 404 });
        return Response.json(user);
      },
    },
  },
});
```

### With Route-Level Middleware

```typescript
export const Route = createFileRoute("/api/data")({
  server: {
    middleware: [authMiddleware, loggerMiddleware],
    handlers: {
      GET: async ({ request }) => {
        return Response.json({ data: "protected" });
      },
    },
  },
});
```

### Escaped File Extensions

**File:** `routes/users[.]json.ts` → URL: `/users.json`

---

## Selective SSR

Routes are SSR-enabled by default. Disable per-route with `ssr: false` or `ssr: "data-only"`.

```typescript
// Fully client-rendered (no SSR)
export const Route = createFileRoute("/dashboard/canvas")({
  ssr: false,
  component: RouteComponent,
});

// Data loads on server, component renders on client only
export const Route = createFileRoute("/dashboard/heavy")({
  ssr: "data-only",
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(orpc.data.find.queryOptions({ input: {} }));
  },
  component: RouteComponent,
});
```

SSR inheritance: child routes can only become MORE restrictive (`true` → `data-only` → `false`).

---

## Environment Functions

Use `createIsomorphicFn` for code that adapts between server and client:

```typescript
import { createIsomorphicFn } from "@tanstack/react-start";

const getConfig = createIsomorphicFn()
  .server(() => ({ apiUrl: process.env.API_URL }))
  .client(() => ({ apiUrl: import.meta.env.VITE_API_URL }));
```

This is how the oRPC client is set up in `apps/web/src/lib/orpc.ts` — server calls use the router directly, client calls use RPC over fetch.

---

## Full Example: Adding a Todos Feature

### 1. Layout: `routes/dashboard/todos/route.tsx`

```typescript
import { createFileRoute, Outlet } from "@tanstack/react-router";

import { routeLoggingMiddleware } from "@/middleware/route-logging";

export const Route = createFileRoute("/dashboard/todos")({
  server: { middleware: [routeLoggingMiddleware] },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-4xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Todos</h1>
      <Outlet />
    </div>
  );
}
```

### 2. List page with search params: `routes/dashboard/todos/index.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

import { orpc } from "@/lib/orpc";
import { TodoList } from "@/routes/dashboard/todos/-components/todo-list";
import { CreateTodoForm } from "@/routes/dashboard/todos/-components/create-todo-form";

const searchSchema = z.object({
  page: fallback(z.number(), 1).default(1),
  filter: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/dashboard/todos/")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ page: search.page, filter: search.filter }),
  loader: ({ context: { queryClient }, deps }) => {
    queryClient.ensureQueryData(
      orpc.todos.findMany.queryOptions({ input: deps })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { page, filter } = Route.useSearch();
  const { data: todos } = useQuery(
    orpc.todos.findMany.queryOptions({ input: { page, filter } })
  );

  return (
    <div className="space-y-6">
      <CreateTodoForm />
      <TodoList todos={todos ?? []} />
    </div>
  );
}
```

### 3. Detail page: `routes/dashboard/todos/$todoId.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { seo } from "@/lib/seo";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/dashboard/todos/$todoId")({
  loader: ({ context: { queryClient }, params: { todoId } }) => {
    return queryClient.ensureQueryData(
      orpc.todos.find.queryOptions({ input: { id: todoId } })
    );
  },
  head: ({ loaderData }) => ({
    meta: [
      ...seo({
        title: `${loaderData?.title ?? "Todo"} - Weldr`,
      }),
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  ),
  notFoundComponent: () => <div>Todo not found</div>,
  component: RouteComponent,
});

function RouteComponent() {
  const { todoId } = Route.useParams();
  const { data: todo } = useQuery(
    orpc.todos.find.queryOptions({ input: { id: todoId } })
  );

  return (
    <div>
      <h2>{todo?.title}</h2>
      <p>{todo?.description}</p>
    </div>
  );
}
```

### 4. Route-scoped component: `routes/dashboard/todos/-components/todo-list.tsx`

```typescript
import { Link } from "@tanstack/react-router";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li key={todo.id}>
          <Link
            to="/dashboard/todos/$todoId"
            params={{ todoId: todo.id }}
            className="hover:underline"
          >
            {todo.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

---

## Quick Reference: File Path → URL

| File Path                                 | URL                             | Type              |
| ----------------------------------------- | ------------------------------- | ----------------- |
| `routes/about.tsx`                        | `/about`                        | Leaf              |
| `routes/dashboard/index.tsx`              | `/dashboard`                    | Index             |
| `routes/dashboard/route.tsx`              | (layout)                        | Layout            |
| `routes/dashboard/$todoId.tsx`            | `/dashboard/:todoId`            | Dynamic           |
| `routes/(marketing)/index.tsx`            | `/`                             | Grouped index     |
| `routes/(marketing)/terms.tsx`            | `/terms`                        | Grouped leaf      |
| `routes/auth/forget-password.confirm.tsx` | `/auth/forget-password/confirm` | Dot-delimited     |
| `routes/files/$.tsx`                      | `/files/*`                      | Splat/wildcard    |
| `routes/api/webhooks/stripe.ts`           | `/api/webhooks/stripe`          | Server route      |
| `routes/users[.]json.ts`                  | `/users.json`                   | Escaped extension |
| `routes/auth/-components/form.tsx`        | (not a route)                   | Scoped component  |

---

## Rules

1. ALWAYS export `Route` using `createFileRoute` — not `createRoute` or any other API.
2. ALWAYS define the component as a **non-exported** function named `RouteComponent` and pass it by name to `component:`.
3. NEVER export `RouteComponent` directly — only reference it by name.
4. The path string in `createFileRoute()` MUST exactly match the generated path. Index routes include trailing slash (`"/dashboard/"`), layouts do not (`"/dashboard"`).
5. NEVER manually edit `routeTree.gen.ts`.
6. Place route-scoped components in `-components/` folders next to their routes.
7. Use `@/` for imports within `apps/web/src/` and `@weldr/*` for monorepo packages.
8. Use `beforeLoad` for auth guards, `loader` for data prefetching, `head` for SEO.
9. Use `server: { middleware: [routeLoggingMiddleware] }` on routes that need server-side logging.
10. Use `Route.useLoaderData()` for loader data, `Route.useParams()` for dynamic params, `Route.useSearch()` for search params.
11. Use `loaderDeps` to declare which search params the loader depends on — this ensures the loader re-runs when those params change.
12. Use `zodValidator()` from `@tanstack/zod-adapter` with `fallback()` + `.default()` for search param schemas.
13. Server functions go in `src/lib/` (e.g., `get-session-fn.ts`), middleware goes in `src/middleware/`.
14. Use `createServerFn` for server-only logic, `createMiddleware` for reusable middleware.
15. Server function middleware uses default type; route request middleware uses `type: "request"`.
