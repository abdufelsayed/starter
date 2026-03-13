import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CreditCardIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import { webEnv } from "@starter/env/web";
import { PLANS } from "@starter/schemas/billing";
import { Badge } from "@starter/ui/components/badge";
import { Button, buttonVariants } from "@starter/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { cn } from "@starter/ui/lib/utils";

import { authClient } from "@/lib/auth";
import { formatBillingDate, getPlanDisplayName, isActiveSubscription, isPlanName } from "./utils";

const billingReturnUrl = `${webEnv.VITE_WEB_URL}/dashboard`;

export function BillingSettings() {
  const queryClient = useQueryClient();
  const { data: subscriptions, isPending } = useQuery(authClient.subscription.list.queryOptions());

  const restore = useMutation(
    authClient.subscription.restore.mutationOptions({
      onError: (error) => {
        toast.error("Error restoring subscription", {
          description: error.message,
        });
      },
      onSuccess: async () => {
        toast.success("Subscription restored");
        await queryClient.invalidateQueries({ queryKey: authClient.subscription.list.key() });
      },
    }),
  );

  const portal = useMutation(
    authClient.subscription.billingPortal.mutationOptions({
      onError: (error) => {
        toast.error("Error opening billing portal", {
          description: error.message,
        });
      },
    }),
  );

  const cancel = useMutation(
    authClient.subscription.cancel.mutationOptions({
      onError: (error) => {
        toast.error("Error cancelling subscription", {
          description: error.message,
        });
      },
    }),
  );

  const activeSubscription = subscriptions?.find(isActiveSubscription) ?? null;

  if (isPending) {
    return null;
  }

  if (!activeSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-4" />
            Billing
          </CardTitle>
          <CardDescription>You are currently on the free plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/pricing" className={cn(buttonVariants({ size: "sm" }), "w-fit")}>
            View Plans
          </Link>
        </CardContent>
      </Card>
    );
  }

  const planKey = isPlanName(activeSubscription.plan) ? activeSubscription.plan : "free";
  const plan = PLANS[planKey];
  const planName = getPlanDisplayName(activeSubscription.plan, planKey);
  const billingPeriodEnd = formatBillingDate(activeSubscription.periodEnd);
  const trialEnd = formatBillingDate(activeSubscription.trialEnd);
  const isCancelling = activeSubscription.cancelAtPeriodEnd;
  const stripeSubscriptionId = activeSubscription.stripeSubscriptionId ?? undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCardIcon className="size-4" />
          Billing
        </CardTitle>
        <CardDescription>Manage your subscription and billing details.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium capitalize">{plan?.name ?? planName} Plan</span>
            {activeSubscription.status === "trialing" ? (
              <Badge variant="secondary">Trialing</Badge>
            ) : isCancelling ? (
              <Badge variant="destructive">Cancelling</Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
          </div>

          {plan ? <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p> : null}

          {trialEnd ? (
            <p className="mt-2 text-sm text-muted-foreground">Trial ends on {trialEnd}.</p>
          ) : null}

          {billingPeriodEnd ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {isCancelling ? "Access ends on" : "Current billing period ends on"}{" "}
              {billingPeriodEnd}.
            </p>
          ) : null}

          {activeSubscription.billingInterval ? (
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              Billing interval: {activeSubscription.billingInterval}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {isCancelling ? (
            <Button
              variant="outline"
              size="sm"
              disabled={restore.isPending}
              onClick={() =>
                restore.mutate(stripeSubscriptionId ? { subscriptionId: stripeSubscriptionId } : {})
              }
            >
              {restore.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
              Restore Subscription
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={portal.isPending}
                onClick={() => portal.mutate({ returnUrl: billingReturnUrl })}
              >
                {portal.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Manage Subscription
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={cancel.isPending}
                onClick={() =>
                  cancel.mutate({
                    returnUrl: billingReturnUrl,
                    ...(stripeSubscriptionId ? { subscriptionId: stripeSubscriptionId } : {}),
                  })
                }
              >
                {cancel.isPending && <LoaderIcon className="mr-2 size-4 animate-spin" />}
                Cancel Subscription
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
