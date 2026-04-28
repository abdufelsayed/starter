# @starter/email

Email templates and sending with React Email and Resend.

This README is explanatory. The strict implementation contract for agents is
[`packages/email/AGENTS.md`](./AGENTS.md).

## Stack

- [React Email](https://react.email) - Email templates as React components
- [Resend](https://resend.com) - Email delivery

## Templates

- Verification email
- Magic link email
- Password reset email
- Password reset success email
- Change email confirmation email
- Delete account verification email
- Two-factor OTP email
- Organization invitation email

## Scripts

```bash
bun dev  # Preview emails in browser (port 3001)
```

## Exports

```ts
import { sendEmail } from "@starter/email";
import { VerificationEmail } from "@starter/email/templates";
```
