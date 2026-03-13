import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";

import { Shell } from "./-components/shell";
import { SupportLinks } from "./-components/support-links";

const ERROR_MESSAGES: Record<string, string> = {
  account_already_linked_to_different_user: "This account is already linked to another user.",
  "email_doesn't_match": "The email from the provider doesn't match your account.",
  email_not_found: "No account found with this email address.",
  invalid_callback_request: "The authentication request was invalid. Please try again.",
  invalid_token: "The link is invalid or has expired. Please request a new one.",
  no_callback_url: "No callback URL was configured. Please try again.",
  no_code: "The provider didn't return an authorization code. Please try again.",
  oauth_provider_not_found: "The authentication provider is not available.",
  signup_disabled: "New account registration is currently disabled.",
  state_mismatch: "Your sign-in session was invalid. Please try again.",
  state_not_found: "Your sign-in session has expired. Please try again.",
  unable_to_get_user_info:
    "Couldn't retrieve your information from the provider. Please try again.",
  unable_to_link_account: "Unable to link this account. It may already be in use.",
};

const DEFAULT_MESSAGE = "An authentication error occurred. Please try again.";

export const Route = createFileRoute("/auth/error")({
  component: AuthErrorPage,
  validateSearch: z.object({
    error: z.string().optional(),
  }),
});

function AuthErrorPage() {
  const { error } = Route.useSearch();
  const message = error ? (ERROR_MESSAGES[error] ?? DEFAULT_MESSAGE) : DEFAULT_MESSAGE;

  return (
    <Shell>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircleIcon className="size-5 text-destructive" />
          </div>
          <span className="text-xl">Something went wrong</span>
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button variant="outline" render={<Link to="/auth/sign-in" />}>
          Back to sign in
        </Button>
        <div className="flex items-center justify-end text-xs text-muted-foreground">
          <SupportLinks />
        </div>
      </CardContent>
    </Shell>
  );
}
