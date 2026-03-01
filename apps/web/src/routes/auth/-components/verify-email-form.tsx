import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, MailCheckIcon } from "lucide-react";

import { buttonVariants } from "@starter/ui/components/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@starter/ui/components/card";
import { cn } from "@starter/ui/lib/utils";

import { Shell } from "./shell";
import { SupportLinks } from "./support-links";

type VerifyEmailFormProps = {
  className?: string;
  email?: string | null;
};

export function VerifyEmailForm({ className, email }: VerifyEmailFormProps) {
  return (
    <Shell className={className}>
      <CardHeader className="flex flex-col items-start justify-start">
        <CardTitle className="flex flex-col gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
            <MailCheckIcon className="size-5 text-primary" />
          </div>
          <span className="text-xl">Email verified</span>
        </CardTitle>
        <CardDescription>
          {email ? (
            <>
              Your email <span className="font-medium text-foreground">{email}</span> has been
              verified successfully.
            </>
          ) : (
            "Your email has been verified successfully."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Link className={cn(buttonVariants({ variant: "default" }), "w-full")} to="/">
          <ArrowLeftIcon className="size-4" />
          Go to home
        </Link>
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <SupportLinks />
        </div>
      </CardContent>
    </Shell>
  );
}
