import { createFileRoute } from "@tanstack/react-router";

import { SubscriptionPlans } from "@/components/billing/subscription-plans";
import { authClient } from "@/lib/auth";

export const Route = createFileRoute("/(marketing)/pricing")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(authClient.session.get.queryOptions());
  },
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground">Choose the plan that works best for you.</p>
      </div>
      <SubscriptionPlans />
    </div>
  );
}
