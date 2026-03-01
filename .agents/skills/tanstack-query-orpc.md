# TanStack Query with oRPC

This skill defines the conventions for using TanStack Query with oRPC in this project. All data fetching and mutations on the web app MUST follow these patterns.

## Project Setup

- The oRPC client is configured in `apps/web/src/lib/orpc.ts`
- It exports `api` (the raw oRPC client) and `orpc` (TanStack Query utilities created via `createTanstackQueryUtils`)
- The `QueryClient` is created in `apps/web/src/lib/tanstack-query/root-provider.tsx` with a custom `queryKeyHashFn` using `StandardRPCJsonSerializer` and a default `staleTime` of 60 seconds
- The `QueryClient` is provided to TanStack Router via the router context in `apps/web/src/router.tsx`
- The root route (`apps/web/src/routes/__root.tsx`) defines the `MyRouterContext` interface with `queryClient: QueryClient`
- Toast notifications use `sonner` (the `<Toaster />` is mounted in the root route)

## Import Pattern

Always import `orpc` from `@/lib/orpc` for query/mutation utilities. Never construct query keys manually.

```typescript
import { orpc } from "@/lib/orpc";
```

## Queries

### Basic Query

Use `orpc.<group>.<procedure>.queryOptions()` with `useQuery` from `@tanstack/react-query`.

```typescript
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

function TodoDetail({ id }: { id: string }) {
  const { data: todo, isLoading, error } = useQuery(
    orpc.todos.find.queryOptions({ input: { id } })
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading todo</div>;

  return (
    <div>
      <h1>{todo.title}</h1>
      <p>{todo.description}</p>
    </div>
  );
}
```

### List Query

```typescript
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

function TodoList() {
  const { data: todos, isLoading } = useQuery(
    orpc.todos.findMany.queryOptions({ input: { status: "active" } })
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### Conditional Query with skipToken

Use `skipToken` from `@tanstack/react-query` to conditionally execute queries. Do NOT use the `enabled` option.

```typescript
import { useQuery, skipToken } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

function TodoDetail({ id }: { id: string | undefined }) {
  const { data: todo } = useQuery(
    orpc.todos.find.queryOptions({ input: id ? { id } : skipToken })
  );

  return todo ? <div>{todo.title}</div> : <div>Select a todo</div>;
}
```

## Mutations with Optimistic Updates

ALL mutations MUST implement optimistic updates. Every mutation follows this structure:

1. `onMutate` -- cancel outgoing queries, snapshot previous data, apply optimistic update
2. `onError` -- roll back to the snapshot on failure
3. `onSettled` -- invalidate queries to refetch fresh data regardless of success or failure

### Create Mutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isDefinedError } from "@orpc/client";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";

function CreateTodo() {
  const queryClient = useQueryClient();

  const createTodo = useMutation(
    orpc.todos.create.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: orpc.todos.key() });

        const previous = queryClient.getQueryData(orpc.todos.findMany.queryKey({ input: {} }));

        queryClient.setQueryData(orpc.todos.findMany.queryKey({ input: {} }), (old) => [
          ...(old ?? []),
          {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        return { previous };
      },
      onError: (error, _input, context) => {
        queryClient.setQueryData(orpc.todos.findMany.queryKey({ input: {} }), context?.previous);

        if (isDefinedError(error)) {
          toast.error("Failed to create todo", {
            description: error.message,
          });
        } else {
          toast.error("Failed to create todo", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      },
      onSuccess: () => {
        toast.success("Todo created", {
          description: "Your todo has been created successfully.",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: orpc.todos.key() });
      },
    }),
  );

  return { createTodo };
}
```

### Update Mutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isDefinedError } from "@orpc/client";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";

function useUpdateTodo() {
  const queryClient = useQueryClient();

  const updateTodo = useMutation(
    orpc.todos.update.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: orpc.todos.key() });

        const previousDetail = queryClient.getQueryData(
          orpc.todos.find.queryKey({ input: { id: input.id } }),
        );
        const previousList = queryClient.getQueryData(orpc.todos.findMany.queryKey({ input: {} }));

        // Optimistically update the detail cache
        queryClient.setQueryData(orpc.todos.find.queryKey({ input: { id: input.id } }), (old) =>
          old ? { ...old, ...input, updatedAt: new Date() } : old,
        );

        // Optimistically update the list cache
        queryClient.setQueryData(orpc.todos.findMany.queryKey({ input: {} }), (old) =>
          old?.map((todo) =>
            todo.id === input.id ? { ...todo, ...input, updatedAt: new Date() } : todo,
          ),
        );

        return { previousDetail, previousList };
      },
      onError: (error, input, context) => {
        queryClient.setQueryData(
          orpc.todos.find.queryKey({ input: { id: input.id } }),
          context?.previousDetail,
        );
        queryClient.setQueryData(
          orpc.todos.findMany.queryKey({ input: {} }),
          context?.previousList,
        );

        if (isDefinedError(error)) {
          toast.error("Failed to update todo", {
            description: error.message,
          });
        } else {
          toast.error("Failed to update todo", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      },
      onSuccess: () => {
        toast.success("Todo updated", {
          description: "Your todo has been updated successfully.",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: orpc.todos.key() });
      },
    }),
  );

  return { updateTodo };
}
```

### Delete Mutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isDefinedError } from "@orpc/client";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";

function useDeleteTodo() {
  const queryClient = useQueryClient();

  const deleteTodo = useMutation(
    orpc.todos.delete.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: orpc.todos.key() });

        const previousList = queryClient.getQueryData(orpc.todos.findMany.queryKey({ input: {} }));

        // Optimistically remove from the list cache
        queryClient.setQueryData(orpc.todos.findMany.queryKey({ input: {} }), (old) =>
          old?.filter((todo) => todo.id !== input.id),
        );

        // Remove from the detail cache
        queryClient.removeQueries({
          queryKey: orpc.todos.find.queryKey({ input: { id: input.id } }),
        });

        return { previousList };
      },
      onError: (error, _input, context) => {
        queryClient.setQueryData(
          orpc.todos.findMany.queryKey({ input: {} }),
          context?.previousList,
        );

        if (isDefinedError(error)) {
          toast.error("Failed to delete todo", {
            description: error.message,
          });
        } else {
          toast.error("Failed to delete todo", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      },
      onSuccess: () => {
        toast.success("Todo deleted", {
          description: "Your todo has been deleted successfully.",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: orpc.todos.key() });
      },
    }),
  );

  return { deleteTodo };
}
```

## Query Key Management

oRPC provides structured query keys. Use these helpers for cache operations -- never construct keys manually.

| Helper                                         | Purpose                | Example                                                                 |
| ---------------------------------------------- | ---------------------- | ----------------------------------------------------------------------- |
| `orpc.<group>.key()`                           | All queries in a group | `queryClient.invalidateQueries({ queryKey: orpc.todos.key() })`         |
| `orpc.<group>.<procedure>.queryKey({ input })` | Specific query key     | `queryClient.getQueryData(orpc.todos.find.queryKey({ input: { id } }))` |

Use `orpc.<group>.key()` in `cancelQueries` and `invalidateQueries` inside mutations to broadly cancel/invalidate all related queries. Use the specific `queryKey` variant with `getQueryData`, `setQueryData`, and `removeQueries` when you need to target an exact cache entry.

## Route Loaders (SSR Data Loading)

Use `queryClient.ensureQueryData` inside TanStack Router route loaders to prefetch data on the server. The `queryClient` is available via the route context.

### Single Resource

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/todos/$id")({
  loader: ({ context: { queryClient }, params: { id } }) => {
    queryClient.ensureQueryData(orpc.todos.find.queryOptions({ input: { id } }));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: todo } = useQuery(orpc.todos.find.queryOptions({ input: { id } }));

  return <div>{todo?.title}</div>;
}
```

### List with Search Params

```typescript
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";
import { orpc } from "@/lib/orpc";

const searchSchema = z.object({
  status: z.enum(["active", "completed"]).optional(),
  page: z.number().default(1),
});

export const Route = createFileRoute("/todos/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps: { search } }) => {
    queryClient.ensureQueryData(
      orpc.todos.findMany.queryOptions({ input: search })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const { data: todos } = useQuery(
    orpc.todos.findMany.queryOptions({ input: search })
  );

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

## Error Handling

Use `isDefinedError` from `@orpc/client` to check if an error is a typed oRPC error (defined in the procedure contract). This gives you access to typed error data.

```typescript
import { isDefinedError } from "@orpc/client";

// Inside a mutation's onError callback:
onError: (error) => {
  if (isDefinedError(error)) {
    // Typed error -- access error.code, error.message, error.data
    switch (error.data.code) {
      case "NOT_FOUND":
        toast.error("Not found", { description: error.message });
        break;
      case "VALIDATION_ERROR":
        toast.error("Validation error", { description: error.message });
        break;
      default:
        toast.error("Error", { description: error.message });
    }
  } else {
    // Unknown/network error
    toast.error("Something went wrong", {
      description: "An unexpected error occurred. Please try again.",
    });
  }
},
```

For queries, handle errors in the component:

```typescript
import { isDefinedError } from "@orpc/client";

function TodoDetail({ id }: { id: string }) {
  const { data, error, isLoading } = useQuery(
    orpc.todos.find.queryOptions({ input: { id } })
  );

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    if (isDefinedError(error)) {
      return <div>Error: {error.message}</div>;
    }
    return <div>An unexpected error occurred</div>;
  }

  return <div>{data.title}</div>;
}
```

## Complete Page Example

This example shows a full page with list query, create mutation, and delete mutation all using optimistic updates and toast notifications.

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { isDefinedError } from "@orpc/client";
import { toast } from "sonner";

import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/todos/")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(
      orpc.todos.findMany.queryOptions({ input: {} })
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: todos } = useQuery(
    orpc.todos.findMany.queryOptions({ input: {} })
  );

  const createTodo = useMutation(
    orpc.todos.create.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: orpc.todos.key() });
        const previous = queryClient.getQueryData(
          orpc.todos.findMany.queryKey({ input: {} })
        );
        queryClient.setQueryData(
          orpc.todos.findMany.queryKey({ input: {} }),
          (old) => [
            ...(old ?? []),
            {
              ...input,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]
        );
        return { previous };
      },
      onError: (error, _input, context) => {
        queryClient.setQueryData(
          orpc.todos.findMany.queryKey({ input: {} }),
          context?.previous
        );
        if (isDefinedError(error)) {
          toast.error("Failed to create todo", { description: error.message });
        } else {
          toast.error("Failed to create todo", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      },
      onSuccess: () => {
        toast.success("Todo created");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: orpc.todos.key() });
      },
    })
  );

  const deleteTodo = useMutation(
    orpc.todos.delete.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: orpc.todos.key() });
        const previous = queryClient.getQueryData(
          orpc.todos.findMany.queryKey({ input: {} })
        );
        queryClient.setQueryData(
          orpc.todos.findMany.queryKey({ input: {} }),
          (old) => old?.filter((todo) => todo.id !== input.id)
        );
        return { previous };
      },
      onError: (error, _input, context) => {
        queryClient.setQueryData(
          orpc.todos.findMany.queryKey({ input: {} }),
          context?.previous
        );
        if (isDefinedError(error)) {
          toast.error("Failed to delete todo", { description: error.message });
        } else {
          toast.error("Failed to delete todo", {
            description: "An unexpected error occurred. Please try again.",
          });
        }
      },
      onSuccess: () => {
        toast.success("Todo deleted");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: orpc.todos.key() });
      },
    })
  );

  return (
    <div>
      <button
        onClick={() => createTodo.mutate({ title: "New Todo", description: "" })}
        disabled={createTodo.isPending}
      >
        Add Todo
      </button>

      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>
            {todo.title}
            <button
              onClick={() => deleteTodo.mutate({ id: todo.id })}
              disabled={deleteTodo.isPending}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Rules

1. ALWAYS import `orpc` from `@/lib/orpc` -- never construct oRPC clients or query keys manually.
2. ALWAYS use `orpc.<group>.<procedure>.queryOptions()` for queries -- never pass raw `queryKey`/`queryFn` objects to `useQuery`.
3. ALWAYS use `orpc.<group>.<procedure>.mutationOptions()` for mutations -- never pass raw `mutationFn` objects to `useMutation`.
4. ALL mutations MUST implement optimistic updates with the `onMutate`/`onError`/`onSettled` pattern.
5. ALWAYS use `orpc.<group>.key()` for `cancelQueries` and `invalidateQueries` inside mutations.
6. ALWAYS use `orpc.<group>.<procedure>.queryKey({ input })` for `getQueryData`, `setQueryData`, and `removeQueries`.
7. ALWAYS use `skipToken` for conditional queries -- never use the `enabled` option.
8. ALWAYS use `queryClient.ensureQueryData` in route loaders for SSR data prefetching.
9. ALWAYS use `isDefinedError` from `@orpc/client` for typed error handling.
10. ALWAYS use `toast` from `sonner` for user-facing success and error feedback in mutation callbacks.
11. NEVER use `api` directly in components -- use `orpc` utilities which integrate with TanStack Query.
