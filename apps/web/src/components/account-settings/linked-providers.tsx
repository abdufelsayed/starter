import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@starter/ui/components/button";
import {
  Card,
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

export function LinkedProviders() {
  const queryClient = useQueryClient();
  const { data: accounts } = useQuery(authClient.account.listAccounts.queryOptions());
  const [pendingProvider, setPendingProvider] = useState<ProviderId | null>(null);

  const linkProvider = useMutation(
    authClient.account.linkSocial.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authClient.account.key() });
      },
      onError: (error) => {
        toast.error("Failed to link account", { description: error.message });
        setPendingProvider(null);
      },
    }),
  );

  const unlinkProvider = useMutation(
    authClient.account.unlinkAccount.mutationOptions({
      onSuccess: () => {
        toast.success("Account unlinked successfully");
        queryClient.invalidateQueries({ queryKey: authClient.account.key() });
      },
      onError: (error) => {
        toast.error("Failed to unlink account", { description: error.message });
      },
    }),
  );

  const linkedProviderIds = new Set(accounts?.map((a) => a.providerId) ?? []);
  const isBusy = linkProvider.isPending || unlinkProvider.isPending;

  const handleLink = (provider: ProviderId) => {
    setPendingProvider(provider);
    linkProvider.mutate({
      provider,
      callbackURL: window.location.href,
    });
  };

  const handleUnlink = (providerId: string) => {
    unlinkProvider.mutate({ providerId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Providers</CardTitle>
        <CardDescription>Connect your account with a third-party service.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {providers.map((provider) => {
            const isLinked = linkedProviderIds.has(provider.id);
            const isLoading =
              (pendingProvider === provider.id && linkProvider.isPending) ||
              (unlinkProvider.isPending && unlinkProvider.variables?.providerId === provider.id);

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
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
