import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { webEnv } from "@starter/env/web";
import type { PlanName } from "@starter/schemas/billing";
import { Button } from "@starter/ui/components/button";
import { cn } from "@starter/ui/lib/utils";

import { authClient } from "@/lib/auth";

export function UpgradeButton({
  className,
  children,
  annual,
  plan,
}: {
  className?: string;
  children?: React.ReactNode;
  annual?: boolean;
  plan: PlanName;
}) {
  const upgrade = useMutation(
    authClient.billing.upgradeSubscription.mutationOptions({
      onError: (error) => {
        toast.error("Error upgrading subscription", {
          description: error.message,
        });
      },
    }),
  );

  return (
    <Button
      variant="default"
      size="sm"
      className={cn("h-7 text-xs", className)}
      disabled={upgrade.isPending}
      onClick={() =>
        upgrade.mutate({
          plan,
          annual,
          successUrl: webEnv.VITE_WEB_URL,
          cancelUrl: webEnv.VITE_WEB_URL + "/pricing",
        })
      }
    >
      {upgrade.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
      {children}
    </Button>
  );
}
