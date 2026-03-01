# @starter/auth

Authentication configuration with Better Auth.

## Stack

- [Better Auth](https://better-auth.com) - Authentication framework
- [Tanstack Query](https://tanstack.com/query) - Client-side queries and mutations and state management
- [Stripe](https://stripe.com) - Subscription billing via `@better-auth/stripe`
- [Drizzle ORM](https://orm.drizzle.team) - Session/account storage

## Features

- Email/password authentication
- Google OAuth
- Stripe subscription integration
- Password reset and email verification
- Organization/team support

## Exports

```ts
import { auth } from "@starter/auth"; // Server auth instance
import { authClient } from "@starter/auth/react"; // React client
```
