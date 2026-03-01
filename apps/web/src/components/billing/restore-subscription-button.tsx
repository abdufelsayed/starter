import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@starter/ui/components/button";
import { cn } from "@starter/ui/lib/utils";

import { authClient } from "@/lib/auth";

export function RestoreSubscriptionButton({ className }: { className?: string }) {
  const queryClient = useQueryClient();
  const restore = useMutation(
    authClient.billing.restoreSubscription.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authClient.billing.key() });
      },
      onError: () => {
        toast.error("Error restoring subscription", {
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
      disabled={restore.isPending}
      onClick={() => restore.mutate({})}
    >
      {restore.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
      Restore Subscription
    </Button>
  );
}
