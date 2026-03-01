import { useMutation } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { webEnv } from "@starter/env/web";
import { Button } from "@starter/ui/components/button";
import { cn } from "@starter/ui/lib/utils";

import { authClient } from "@/lib/auth";

export function ManageSubscriptionButton({ className }: { className?: string }) {
  const portal = useMutation(
    authClient.billing.billingPortal.mutationOptions({
      onError: (error) => {
        toast.error("Error opening billing portal", {
          description: error.message,
        });
      },
    }),
  );

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("w-full", className)}
      disabled={portal.isPending}
      onClick={() => portal.mutate({ returnUrl: webEnv.VITE_WEB_URL + "/billing" })}
    >
      {portal.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
      Manage Subscription
    </Button>
  );
}
