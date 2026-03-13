import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@starter/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { GithubLogo } from "@starter/ui/logos/github";
import { GoogleLogo } from "@starter/ui/logos/google";

import { authClient } from "@/lib/auth";

const providers = [
  {
    id: "github",
    label: "GitHub",
    logo: GithubLogo,
  },
  {
    id: "google",
    label: "Google",
    logo: GoogleLogo,
  },
] as const;

type ProviderId = (typeof providers)[number]["id"];

export function LinkedProviders({ onBack }: { onBack?: () => void }) {
  const queryClient = useQueryClient();
  const { data: accounts } = useSuspenseQuery(authClient.listAccounts.queryOptions());
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(null);

  const linkProvider = useMutation(
    authClient.linkSocial.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
        setPendingProvider(null);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: authClient.listAccounts.key() });
      },
    }),
  );

  const unlinkProvider = useMutation(
    authClient.unlinkAccount.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: async () => {
        toast.success("Account unlinked successfully");
        await queryClient.invalidateQueries({ queryKey: authClient.listAccounts.key() });
      },
    }),
  );

  const linkedProviderIds = new Set(accounts?.map((a) => a.providerId));
  const isBusy = linkProvider.isPending || unlinkProvider.isPending;

  const handleLink = (provider: ProviderId) => {
    setPendingProvider(provider);
    linkProvider.mutate({
      callbackURL: window.location.href,
      errorCallbackURL: `${window.location.origin}/auth/error`,
      provider,
    });
  };

  const handleUnlink = (providerId: string) => {
    unlinkProvider.mutate({ providerId });
  };

  return (
    <Card className="rounded-xl shadow-none ring-0">
      <CardHeader>
        <CardTitle>Linked Providers</CardTitle>
        <CardDescription>Connect your account with a third-party service.</CardDescription>
        {onBack ? (
          <CardAction>
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {providers.map((provider) => {
            const isLinked = linkedProviderIds.has(provider.id);
            const isLoading =
              (pendingProvider === provider.id && linkProvider.isPending) ||
              (unlinkProvider.isPending && unlinkProvider.variables?.providerId === provider.id);

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <provider.logo className="size-5" />
                  <span className="text-sm font-medium">{provider.label}</span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={isLinked ? "outline" : "default"}
                  disabled={isBusy}
                  onClick={() => (isLinked ? handleUnlink(provider.id) : handleLink(provider.id))}
                >
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {isLinked ? "Unlink" : "Link"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
