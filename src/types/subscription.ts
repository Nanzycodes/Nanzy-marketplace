/**
 * Seller subscription domain models (TypeScript).
 * Standard plans for marketplace access.
 */

export type SubscriptionPlanId = "basic" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "none"
  | "trial"
  | "active"
  | "expired"
  | "cancelled";

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  priceMonthlyNgn: number;
  features: string[];
  productLimit: number | null; // null = unlimited
  highlighted?: boolean;
}

export interface SellerSubscription {
  sellerId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  startedAt: string | null;
  endsAt: string | null;
  autoRenew: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    priceMonthlyNgn: 5000,
    productLimit: 20,
    features: [
      "Up to 20 products",
      "Basic sales stats",
      "Customer reviews inbox",
      "14-day free trial",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyNgn: 15000,
    productLimit: null,
    highlighted: true,
    features: [
      "Unlimited products",
      "Priority listing",
      "Response-rate insights",
      "Email support",
      "Monthly performance report",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthlyNgn: 40000,
    productLimit: null,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom branding",
      "API access",
      "SLA support",
    ],
  },
];

export function formatPlanPrice(plan: SubscriptionPlan): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(plan.priceMonthlyNgn);
}

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === "active" || status === "trial";
}

export function canListProducts(status: SubscriptionStatus): boolean {
  return isSubscriptionActive(status);
}
