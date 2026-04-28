# @starter/auth

Authentication configuration with Better Auth.

This README is explanatory. The strict implementation contract for agents is
[`packages/auth/AGENTS.md`](./AGENTS.md).

## Stack

- [Better Auth](https://better-auth.com) - Authentication framework
- [TanStack Query](https://tanstack.com/query) - Client-side query and mutation helpers
- [Stripe](https://stripe.com) - Subscription billing via `@better-auth/stripe`
- [Drizzle ORM](https://orm.drizzle.team) - Session/account storage

## Features

- Email/password authentication
- Google OAuth
- Magic links
- Two-factor authentication
- Stripe subscription integration
- Password reset and email verification
- Organization/team support

## Boundaries

`@starter/auth` owns the server Better Auth instance and the reusable React client factory. Apps own
runtime wiring such as request headers, credentials, and redirects.

## Exports

```ts
import { auth } from "@starter/auth"; // Server auth instance
import { createAuthClient } from "@starter/auth/react"; // React client factory
```
