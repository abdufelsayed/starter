import { describe, expect, it } from "vitest";

import {
  formatBillingDate,
  getPlanDisplayName,
  isActiveSubscription,
  isPlanName,
} from "@/components/billing/utils";

describe("billing utils", () => {
  it("recognizes configured plan names", () => {
    expect(isPlanName("free")).toBe(true);
    expect(isPlanName("pro")).toBe(true);
    expect(isPlanName("enterprise")).toBe(false);
  });

  it("treats active and trialing subscriptions as active", () => {
    expect(isActiveSubscription({ status: "active" })).toBe(true);
    expect(isActiveSubscription({ status: "trialing" })).toBe(true);
    expect(isActiveSubscription({ status: "canceled" })).toBe(false);
    expect(isActiveSubscription(null)).toBe(false);
  });

  it("returns a display name with a fallback", () => {
    expect(getPlanDisplayName("pro")).toBe("pro");
    expect(getPlanDisplayName("custom")).toBe("custom");
    expect(getPlanDisplayName(undefined)).toBe("free");
  });

  it("formats valid billing dates and rejects invalid values", () => {
    expect(formatBillingDate("not-a-date")).toBeNull();
    expect(formatBillingDate(null)).toBeNull();
    expect(formatBillingDate(new Date("2026-04-28T00:00:00.000Z"))).toEqual(expect.any(String));
  });
});
