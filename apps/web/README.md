# @starter/web

TanStack Start frontend application.

This README is explanatory. The strict implementation contract for agents is [`apps/web/AGENTS.md`](./AGENTS.md).

## Official References

- [TanStack Router routing concepts](https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts)
- [TanStack Router code splitting](https://tanstack.com/router/latest/docs/guide/code-splitting)
- [TanStack Router external data loading](https://tanstack.com/router/latest/docs/guide/external-data-loading)
- [TanStack Router authenticated routes](https://tanstack.com/router/latest/docs/framework/react/guide/authenticated-routes)
- [TanStack Start server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Query overview](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Form React docs](https://tanstack.com/form/latest/docs/framework/react)
- [TanStack Table React adapter](https://tanstack.com/table/v8/docs/framework/react/react-table)
- [TanStack Table state guide](https://tanstack.com/table/latest/docs/framework/react/guide/table-state)
- [shadcn/ui monorepo](https://ui.shadcn.com/docs/monorepo)
- [shadcn/ui TanStack Form](https://ui.shadcn.com/docs/forms/tanstack-form)

## Design

The web app uses TanStack Router routes to coordinate navigation, auth, search params, and critical
data loading. UI is split by reuse level:

```txt
src/
  routes/                  # Route config, loaders, route layouts
    auth/
      route.tsx
      -components/         # Private to the auth route group
  components/              # Reusable product-aware app components
    account-settings/
    billing/
    organization-settings/
  lib/                     # Frontend clients and app helpers
  middleware/              # TanStack Start middleware
```

Use `packages/ui` for reusable product-agnostic primitives only.

## TanStack Responsibilities

The starter already includes the TanStack libraries needed for most medium/large app surfaces. Use
the installed stack before adding another state, table, or form library.

| Need | Use | Pattern |
| --- | --- | --- |
| URL state, route params, route layouts, auth gates | TanStack Router | `createFileRoute`, `validateSearch`, `beforeLoad`, `loader`, typed links/navigation |
| SSR app runtime and request plumbing | TanStack Start | server functions for headers, redirects, middleware, and framework integration |
| Server state | TanStack Query | oRPC/Better Auth `queryOptions` and `mutationOptions`, loader preloads, targeted invalidation |
| Router + Query SSR hydration | `@tanstack/react-router-ssr-query` | the existing router/query provider setup in `src/router.tsx` and `src/lib/tanstack-query` |
| Interactive forms | TanStack Form | `useForm`, shared Zod schemas, shadcn `Field` components |
| Data grids | TanStack Table | controlled sorting/filtering/pagination/selection state with `@starter/ui` table/data-grid markup |
| Development diagnostics | TanStack Devtools | inspect Router and Query behavior during development only |

Do not add TanStack DB, Store, Virtual, Pacer, Hotkeys, AI, or another TanStack package as a default
starter pattern. Add a new library only when a task explicitly needs it and the root package catalog
is updated.

## Route Pattern

Small routes can be single files:

```txt
src/routes/pricing.tsx
```

Larger routes should use a directory route:

```txt
src/routes/projects/
  route.tsx
  -components/
    projects-table.tsx
    project-filters.tsx
  -hooks/
    use-project-search.ts
```

Route files own:

- `validateSearch`
- `beforeLoad`
- `loader`
- `head`
- route-level layout and `Outlet`
- route error, pending, and not-found components

Move non-trivial UI into `-components`.

## Data Loading

Preload critical page data in route loaders:

```ts
export const Route = createFileRoute("/_protected/projects")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      orpc.projects.list.queryOptions({
        input: { limit: 25 },
      }),
    ),
  component: ProjectsPage,
});
```

Read preloaded data with Suspense-aware Query hooks:

```ts
const { data } = useSuspenseQuery(
  orpc.projects.list.queryOptions({
    input: { limit: 25 },
  }),
);
```

Use `useQuery` for optional or conditionally enabled data. Use mutations for writes and invalidate
the smallest useful query keys after success.

## Tables And Lists

Use TanStack Table when the table has real interaction state such as sorting, filters, pagination,
row selection, column visibility, column sizing, or server-driven list parameters.

Keep shareable table state in Router search params, then feed that state into the route loader query
input:

```ts
export const Route = createFileRoute("/_protected/projects")({
  validateSearch: projectSearchSchema,
  loader: ({ context, search }) =>
    context.queryClient.ensureQueryData(
      orpc.projects.list.queryOptions({
        input: {
          page: search.page,
          pageSize: search.pageSize,
          sort: search.sort,
        },
      }),
    ),
});
```

Use plain `@starter/ui/components/table` for small static tables that do not need TanStack Table
state.

## Forms

Use TanStack Form, Zod, and shadcn `Field` components.

```tsx
<form.Field name="name">
  {(field) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={isInvalid}
        />
        {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
      </Field>
    );
  }}
</form.Field>
```

Use shared schemas from `@starter/schemas` when validation is shared with API contracts or other UI.

## shadcn Monorepo Setup

This app has a `components.json` so the shadcn CLI can install app-level blocks into `apps/web` and
shared primitives into `packages/ui`.

Run CLI commands from `apps/web` when adding app blocks:

```bash
bunx --bun shadcn@latest add login-01
```

Run from `packages/ui` when adding or updating shared primitives:

```bash
bunx --bun shadcn@latest add button
```

Always inspect generated files before keeping them.

## Scripts

```bash
bun dev        # Start dev server (port 3000)
bun build      # Production build
bun preview    # Preview production build
bun start      # Start production server
bun typecheck  # Run type checking
bun test       # Run tests
```
