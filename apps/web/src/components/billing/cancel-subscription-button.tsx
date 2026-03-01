import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@starter/ui/components/button";
import { cn } from "@starter/ui/lib/utils";

import { authClient } from "@/lib/auth";

export function CancelSubscriptionButton({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const cancel = useMutation(
    authClient.billing.cancelSubscription.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authClient.billing.key() });
      },
      onError: () => {
        toast.error("Error cancelling subscription", {
          description: "An unknown error occurred",
        });
      },
    }),
  );

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("w-full", className)}
      disabled={cancel.isPending}
      onClick={() => cancel.mutate({ returnUrl: "/" })}
    >
      {cancel.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
      Cancel Subscription
    </Button>
  );
}
