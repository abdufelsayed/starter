import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRightIcon, MailIcon, ShieldCheckIcon, UserIcon } from "lucide-react";

import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";

import { authClient } from "@/lib/auth";

export function AccountOverview({ onBack }: { onBack?: () => void }) {
  const { data: session } = useSuspenseQuery(authClient.getSession.queryOptions());
  const { data: accounts } = useSuspenseQuery(authClient.listAccounts.queryOptions());

  const linkedProviders = accounts?.filter((account) => account.providerId !== "credential") ?? [];

  return (
    <Card className="rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
        <CardDescription>Your profile, sign-in methods, and security status.</CardDescription>
        {onBack ? (
          <CardAction>
            <Button type="button" variant="ghost" size="icon" onClick={onBack}>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <UserIcon className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session?.user.name}</p>
            <p className="text-xs text-muted-foreground">Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <MailIcon className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session?.user.email}</p>
            <p className="text-xs text-muted-foreground">Email</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <ShieldCheckIcon className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1">
              <Badge variant={session?.user.twoFactorEnabled ? "default" : "outline"}>
                2FA {session?.user.twoFactorEnabled ? "on" : "off"}
              </Badge>
              <Badge variant="secondary">{linkedProviders.length} providers</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Security</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
