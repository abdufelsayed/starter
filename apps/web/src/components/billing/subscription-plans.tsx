import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

import { PLANS, TRIAL_DAYS, type PlanName } from "@starter/schemas/billing";
import { Badge } from "@starter/ui/components/badge";
import { buttonVariants } from "@starter/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@starter/ui/components/card";
import { cn } from "@starter/ui/lib/utils";

import { authClient } from "@/lib/auth";
import { CancelSubscriptionButton } from "./cancel-subscription-button";
import { ManageSubscriptionButton } from "./manage-subscription-button";
import { RestoreSubscriptionButton } from "./restore-subscription-button";
import { UpgradeButton } from "./upgrade-button";

const PAID_PLANS: {
  key: "pro" | "max";
  highlighted: boolean;
}[] = [
  { key: "pro", highlighted: true },
  { key: "max", highlighted: false },
];

export function SubscriptionPlans() {
  const [annual, setAnnual] = useState(false);
  const { data: session } = useQuery(authClient.session.get.queryOptions());
  const { data: activeSubscription } = useQuery(
    authClient.billing.activeSubscription.queryOptions(),
  );

  const annualSavings = Math.round(
    ((PLANS.pro.price * 12 - PLANS.pro.annualPrice * 12) / (PLANS.pro.price * 12)) * 100,
  );
  const billingPeriod = annual ? "yr" : "mo";

  const activePlan = activeSubscription?.plan as PlanName | undefined;

  return (
    <div className="flex w-full flex-col items-center gap-10">
      {/* Billing toggle */}
      <div className="flex items-center gap-2 rounded-full border p-1">
        <button
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
          onClick={() => setAnnual(true)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            annual
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Annual
          {annualSavings > 0 && (
            <Badge variant="secondary" className="ml-2">
              Save {annualSavings}%
            </Badge>
          )}
        </button>
      </div>

      {/* Plan cards */}
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
              {PLANS.free.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Paid plan cards */}
        {PAID_PLANS.map(({ key, highlighted }) => {
          const plan = PLANS[key];
          const price = annual ? plan.annualPrice : plan.price;
          const isActive = activePlan === key;
          const isCancelling = isActive && activeSubscription?.cancelAtPeriodEnd;

          return (
            <Card
              key={key}
              className={cn(
                "relative flex flex-col gap-6 overflow-visible",
                highlighted && "border-primary ring-1 ring-primary",
              )}
            >
              {highlighted && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{plan.name}</span>
                    {isActive && <Badge variant="secondary">Current Plan</Badge>}
                    {TRIAL_DAYS > 0 && !isActive && (
                      <Badge variant="secondary">{TRIAL_DAYS}-day trial</Badge>
                    )}
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
                  isActive={isActive}
                  isCancelling={!!isCancelling}
                  session={!!session}
                  highlighted={highlighted}
                  annual={annual}
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
  planKey,
  isActive,
  isCancelling,
  session,
  highlighted,
  annual,
}: {
  planKey: PlanName;
  isActive: boolean;
  isCancelling: boolean;
  session: boolean;
  highlighted: boolean;
  annual: boolean;
}) {
  const variant = highlighted ? "default" : "outline";

  if (!session) {
    return (
      <Link to="/auth/sign-up" className={cn(buttonVariants({ variant, size: "sm" }), "w-full")}>
        Get Started
      </Link>
    );
  }

  if (isActive && isCancelling) {
    return <RestoreSubscriptionButton className="w-full" />;
  }

  if (isActive) {
    return (
      <div className="flex flex-col gap-2">
        <ManageSubscriptionButton className="w-full" />
        <CancelSubscriptionButton className="w-full" />
      </div>
    );
  }

  return (
    <UpgradeButton
      plan={planKey}
      annual={annual}
      className={cn(buttonVariants({ variant, size: "sm" }), "w-full")}
    >
      Start Free Trial
    </UpgradeButton>
  );
}
