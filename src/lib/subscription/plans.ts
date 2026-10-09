/**
 * Subscription business rules (testable, no UI).
 */
import type { SubscriptionPlanId, SubscriptionStatus } from "@/types/subscription";
import { SUBSCRIPTION_PLANS, isSubscriptionActive } from "@/types/subscription";

export function getPlan(id: SubscriptionPlanId) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id);
}

export function assertCanSell(status: SubscriptionStatus): {
  ok: boolean;
  reason?: string;
} {
  if (!isSubscriptionActive(status)) {
    return {
      ok: false,
      reason: "Active or trial subscription required to sell on the platform.",
    };
  }
  return { ok: true };
}

export function daysRemaining(endsAt: string | null): number | null {
  if (!endsAt) return null;
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)));
}

export function nextBillingDate(from: Date = new Date()): string {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}
