import { PLANS, type PlanName } from "@starter/schemas/billing";

export function isPlanName(value: unknown): value is PlanName {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PLANS, value);
}

export function isActiveSubscription(
  subscription: { status?: unknown } | null | undefined,
): boolean {
  return subscription?.status === "active" || subscription?.status === "trialing";
}

export function getPlanDisplayName(value: unknown, fallback = "free"): string {
  if (isPlanName(value)) {
    return PLANS[value].name;
  }

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return fallback;
}

export function formatBillingDate(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString();
}
