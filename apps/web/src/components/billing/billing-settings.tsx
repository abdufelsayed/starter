import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CreditCardIcon } from "lucide-react";

import { PLANS, type PlanName } from "@starter/schemas/billing";
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

export function BillingSettings() {
  const { data: activeSubscription, isLoading } = useQuery(
    authClient.billing.activeSubscription.queryOptions(),
  );

  if (isLoading) {
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
          <CardDescription>You don't have an active subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/pricing" className={cn(buttonVariants({ size: "sm" }), "w-fit")}>
            View Plans
          </Link>
        </CardContent>
      </Card>
    );
  }

  const planKey = activeSubscription.plan as PlanName;
  const plan = PLANS[planKey];
  const isCancelling = activeSubscription.cancelAtPeriodEnd;

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
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium capitalize">{plan?.name ?? planKey} Plan</span>
              {isCancelling ? (
                <Badge variant="destructive">Cancelling</Badge>
              ) : (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
            {plan && <p className="text-sm text-muted-foreground">{plan.description}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          {isCancelling ? (
            <RestoreSubscriptionButton />
          ) : (
            <>
              <ManageSubscriptionButton />
              <CancelSubscriptionButton />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
