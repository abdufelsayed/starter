import { useMutation } from "@tanstack/react-query";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@starter/ui/components/badge";
import { Button } from "@starter/ui/components/button";
import { GithubLogo } from "@starter/ui/logos/github";
import { GoogleLogo } from "@starter/ui/logos/google";

import { authClient } from "@/lib/auth";

const providers = [
  {
    name: "google",
    logo: GoogleLogo,
  },
  {
    name: "github",
    logo: GithubLogo,
  },
] as const;

type Provider = "google" | "github";

export function Socials({ disabled }: { disabled?: boolean }) {
  const { lastUsedLoginMethod } = useLoaderData({ from: "/auth" });
  const search = useSearch({ from: "/auth" });
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const signInSocial = useMutation(
    authClient.session.signInSocial.mutationOptions({
      onError: (error) => {
        toast.error("Failed to sign in", { description: error.message });
      },
    }),
  );

  async function onSocialSignIn(provider: Provider) {
    setPendingProvider(provider);
    await signInSocial.mutateAsync(
      {
        provider,
        callbackURL: search.redirect ?? window.location.href,
      },
      {
        onSettled: () => {
          setPendingProvider(null);
        },
      },
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {providers.map((provider) => (
        <Button
          key={provider.name}
          variant="outline"
          className="relative grid grid-cols-12"
          aria-disabled={pendingProvider !== null || disabled}
          disabled={pendingProvider !== null || disabled}
          onClick={() => onSocialSignIn(provider.name)}
        >
          <div className="col-end-5">
            {pendingProvider === provider.name ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <provider.logo className="size-4" />
            )}
          </div>
          <span>
            Continue with {provider.name.charAt(0).toUpperCase() + provider.name.slice(1)}
          </span>
          {lastUsedLoginMethod === provider.name && (
            <Badge
              variant="outline"
              className="absolute -top-2.5 -right-2 bg-background dark:bg-muted"
            >
              Last used
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
