import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { webEnv } from "@starter/env/web";
import { PLANS, TRIAL_DAYS, type PlanName } from "@starter/schemas/billing";
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
import { isActiveSubscription, isPlanName } from "./utils";

const PAID_PLANS: {
  key: "pro" | "max";
  highlighted: boolean;
}[] = [
  { key: "pro", highlighted: true },
  { key: "max", highlighted: false },
];

export function SubscriptionPlans() {
  const [annual, setAnnual] = useState(false);
  const { data: session } = useQuery(authClient.getSession.queryOptions());
  const { data: subscriptions } = useQuery(
    authClient.subscription.list.queryOptions({
      enabled: !!session,
    }),
  );

  const activeSubscription = subscriptions?.find(isActiveSubscription) ?? null;
  const activePlan = isPlanName(activeSubscription?.plan) ? activeSubscription.plan : undefined;
  const annualSavings = Math.round(
    ((PLANS.pro.price * 12 - PLANS.pro.annualPrice * 12) / (PLANS.pro.price * 12)) * 100,
  );
  const billingPeriod = annual ? "yr" : "mo";

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="flex items-center gap-2 rounded-full border p-1">
        <button
          type="button"
          onClick={() => setAnnual(false)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            !annual
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setAnnual(true)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            annual
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Annual
          {annualSavings > 0 ? (
            <Badge variant="secondary" className="ml-2">
              Save {annualSavings}%
            </Badge>
          ) : null}
        </button>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {/* Free card */}
        <Card className="flex flex-col gap-6">
          <CardHeader>
            <CardTitle className="flex flex-col gap-2">
              <span className="text-sm font-medium">Free</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${PLANS.free.price}</span>
                <span className="text-sm text-muted-foreground">/ {billingPeriod}</span>
              </div>
            </CardTitle>
            <CardDescription>{PLANS.free.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            {activePlan === "free" || (!activePlan && session) ? (
              <div
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "pointer-events-none w-full",
                )}
              >
                Current Plan
              </div>
            ) : !session ? (
              <Link
                to="/auth/sign-up"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
              >
                Get Started
              </Link>
            ) : null}
            <ul className="space-y-3 text-sm">
              {PLANS.free.features.map((feature: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {PAID_PLANS.map(({ key, highlighted }) => {
          const plan = PLANS[key];
          const price = annual ? plan.annualPrice : plan.price;
          const isActive = activePlan === key;
          const isCancelling = isActive && !!activeSubscription?.cancelAtPeriodEnd;

          return (
            <Card
              key={key}
              className={cn(
                "relative flex flex-col gap-6 overflow-visible",
                highlighted && "border-primary ring-1 ring-primary",
              )}
            >
              {highlighted ? (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most Popular</Badge>
              ) : null}
              <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{plan.name}</span>
                    {isActive ? <Badge variant="secondary">Current Plan</Badge> : null}
                    {TRIAL_DAYS > 0 && !isActive ? (
                      <Badge variant="secondary">{TRIAL_DAYS}-day trial</Badge>
                    ) : null}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-sm text-muted-foreground">/ {billingPeriod}</span>
                  </div>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <PlanAction
                  planKey={key}
                  annual={annual}
                  currentSubscriptionId={activeSubscription?.stripeSubscriptionId ?? undefined}
                  highlighted={highlighted}
                  isActive={isActive}
                  isCancelling={isCancelling}
                  session={!!session}
                />
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckIcon className="size-3.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PlanAction({
  annual,
  currentSubscriptionId,
  highlighted,
  planKey,
  isActive,
  isCancelling,
  session,
}: {
  annual: boolean;
  currentSubscriptionId?: string;
  highlighted: boolean;
  planKey: PlanName;
  isActive: boolean;
  isCancelling: boolean;
  session: boolean;
}) {
  const queryClient = useQueryClient();
  const variant = highlighted ? "default" : "outline";

  const upgrade = useMutation(
    authClient.subscription.upgrade.mutationOptions({
      onError: (error) => {
        toast.error("Error upgrading subscription", {
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

  const restore = useMutation(
    authClient.subscription.restore.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: authClient.subscription.list.key(),
        });
        toast.success("Subscription restored");
      },
      onError: (error) => {
        toast.error("Error restoring subscription", {
          description: error.message,
        });
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

  if (!session) {
    return (
      <Link to="/auth/sign-up" className={cn(buttonVariants({ variant, size: "sm" }), "w-full")}>
        Get Started
      </Link>
    );
  }

  if (isActive && isCancelling) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        disabled={restore.isPending}
        onClick={() =>
          restore.mutate(currentSubscriptionId ? { subscriptionId: currentSubscriptionId } : {})
        }
      >
        {restore.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
        Restore Subscription
      </Button>
    );
  }

  if (isActive) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={portal.isPending}
          onClick={() => portal.mutate({ returnUrl: `${webEnv.VITE_WEB_URL}/pricing` })}
        >
          {portal.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
          Manage Subscription
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={cancel.isPending}
          onClick={() =>
            cancel.mutate({
              returnUrl: `${webEnv.VITE_WEB_URL}/pricing`,
              ...(currentSubscriptionId ? { subscriptionId: currentSubscriptionId } : {}),
            })
          }
        >
          {cancel.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
          Cancel Subscription
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      className="w-full"
      disabled={upgrade.isPending}
      onClick={() =>
        upgrade.mutate({
          annual,
          ...(currentSubscriptionId ? { subscriptionId: currentSubscriptionId } : {}),
          cancelUrl: `${webEnv.VITE_WEB_URL}/pricing`,
          plan: planKey,
          successUrl: `${webEnv.VITE_WEB_URL}/dashboard`,
        })
      }
    >
      {upgrade.isPending && <LoaderIcon className="mr-1 size-3 animate-spin" />}
      Start Free Trial
    </Button>
  );
}
