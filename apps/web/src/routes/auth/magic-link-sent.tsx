import { createFileRoute, Link } from "@tanstack/react-router";
import { MailIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";

import { Shell } from "@/routes/auth/-components/shell";
import { SupportLinks } from "@/routes/auth/-components/support-links";

const magicLinkSentSearchSchema = z.object({
  email: z.string().optional(),
});

export const Route = createFileRoute("/auth/magic-link-sent")({
  validateSearch: magicLinkSentSearchSchema,
  component: MagicLinkSentPage,
});

function MagicLinkSentPage() {
  const { email } = Route.useSearch();

  return (
    <Shell className={undefined}>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <MailIcon className="size-5 text-primary" />
          </div>
          <span className="text-xl">Check your email</span>
        </CardTitle>
        <CardDescription>
          We sent a sign-in link to{" "}
          {email ? <span className="font-medium">{email}</span> : "your email"}. Click the link in
          the email to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Link to="/auth/sign-in">
          <Button variant="outline" className="w-full">
            Back to sign in
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row md:gap-0">
          <div>
            No account?{" "}
            <Link to="/auth/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <SupportLinks />
        </div>
      </CardContent>
    </Shell>
  );
}
