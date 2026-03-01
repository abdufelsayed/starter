import type { BetterAuthClient } from "./client";
import { createMutation, createQuery, createQueryWithInput } from "./utils";

const KEY = ["auth", "billing"] as const;

export function createBillingModule(client: BetterAuthClient) {
  return {
    key: () => [...KEY],

    activeSubscription: createQuery({
      key: [...KEY, "activeSubscription"],
      queryFn: async () => {
        const result = await client.subscription.list();

        const subscriptions = result.data;
        const active = subscriptions?.find(
          (subscription: { status: string }) =>
            subscription.status === "active" || subscription.status === "trialing",
        );

        if (!active) return null;

        return {
          id: active.id,
          plan: active.plan,
          referenceId: active.referenceId,
          status: active.status,
          cancelAtPeriodEnd: active.cancelAtPeriodEnd,
          seats: active.seats,
          trialStart: active.trialStart,
          trialEnd: active.trialEnd,
          periodStart: active.periodStart,
          periodEnd: active.periodEnd,
          billingInterval: active.billingInterval,
          stripeSubscriptionId: active.stripeSubscriptionId,
        };
      },
      defaults: { staleTime: Infinity },
    }),

    listSubscriptions: createQueryWithInput({
      key: [...KEY, "listSubscriptions"],
      queryFn: async (input: { referenceId?: string; customerType?: "user" | "organization" }) => {
        const result = await client.subscription.list({
          query: input,
        });
        if (result.error) throw result.error;
        return result.data;
      },
      defaults: { staleTime: Infinity },
    }),

    upgradeSubscription: createMutation({
      key: [...KEY, "upgradeSubscription"],
      mutationFn: async (data: {
        plan: string;
        successUrl: string;
        cancelUrl: string;
        annual?: boolean;
        referenceId?: string;
        customerType?: "organization";
        seats?: number;
        scheduleAtPeriodEnd?: boolean;
      }) => {
        const result = await client.subscription.upgrade(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    cancelSubscription: createMutation({
      key: [...KEY, "cancelSubscription"],
      mutationFn: async (data: {
        returnUrl: string;
        subscriptionId?: string;
        referenceId?: string;
        customerType?: "organization";
      }) => {
        const result = await client.subscription.cancel(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    restoreSubscription: createMutation({
      key: [...KEY, "restoreSubscription"],
      mutationFn: async (data?: {
        subscriptionId?: string;
        referenceId?: string;
        customerType?: "organization";
      }) => {
        const result = await client.subscription.restore(data ?? {});
        if (result.error) throw result.error;
        return result.data;
      },
    }),

    billingPortal: createMutation({
      key: [...KEY, "billingPortal"],
      mutationFn: async (data: {
        returnUrl: string;
        referenceId?: string;
        customerType?: "organization";
      }) => {
        const result = await client.subscription.billingPortal(data);
        if (result.error) throw result.error;
        return result.data;
      },
    }),
  };
}
