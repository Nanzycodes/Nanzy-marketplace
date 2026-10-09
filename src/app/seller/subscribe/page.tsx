"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { activateSellerSubscription } from "@/lib/db/sellers";
import {
  SUBSCRIPTION_PLANS,
  formatPlanPrice,
  type SubscriptionPlanId,
} from "@/types/subscription";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function SellerSubscribePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<SubscriptionPlanId>("pro");
  const [tab, setTab] = useState("plans");
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = () => {
    startTransition(async () => {
      const result = await activateSellerSubscription(selected);
      if (result.success) {
        toast({
          title: "Subscription activated",
          description: `${selected} plan is active (demo — no charge). Admin approval may still be required.`,
          tone: "success",
        });
        setTimeout(() => router.push("/seller"), 1200);
      } else {
        toast({
          title: "Could not activate",
          description: result.error || "Register as a seller first.",
          tone: "error",
        });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">Seller subscription</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Subscribe to list products and receive orders. Demo mode activates free
        (no Paystack charge) so you can demonstrate the full flow.
      </p>

      <Tabs
        className="mb-8"
        items={[
          { id: "plans", label: "Plans" },
          { id: "faq", label: "How it works" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "plans" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={cn(
                  "text-left rounded-xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                  selected === plan.id
                    ? "border-black ring-2 ring-black dark:border-white dark:ring-white"
                    : "dark:border-gray-800 hover:border-gray-400",
                  plan.highlighted && "bg-gray-50 dark:bg-gray-900/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{plan.name}</p>
                  {plan.highlighted && (
                    <span className="text-[10px] uppercase tracking-wide bg-black text-white px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold mt-1">
                  {formatPlanPrice(plan)}
                  <span className="text-xs font-normal text-gray-500">
                    {" "}
                    / mo
                  </span>
                </p>
                <ul className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <Button loading={isPending} onClick={handleSubscribe} size="lg">
            Activate {selected} (demo free)
          </Button>
        </>
      )}

      {tab === "faq" && (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            <strong>Trial:</strong> New sellers get a 14-day trial when they
            register.
          </p>
          <p>
            <strong>Active:</strong> Required to keep listing products after
            trial. In production this would charge via Paystack; this demo
            activates without payment.
          </p>
          <p>
            <strong>Admin approval:</strong> Stores stay hidden until an admin
            approves them under Admin → Sellers.
          </p>
          <p>
            <strong>Rankings:</strong> Star ratings and reply rate affect how
            admins prioritize sellers.
          </p>
        </div>
      )}
    </div>
  );
}
