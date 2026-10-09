"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

type VerifyState = "loading" | "success" | "failed" | "error";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    const orderIdParam = searchParams.get("order_id");

    if (!reference) {
      setState("error");
      setMessage("No payment reference found.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference,
            orderId: orderIdParam,
          }),
        });

        const data = await res.json();

        if (data.success && data.status === "success") {
          setState("success");
          setOrderId(data.orderId || orderIdParam);
          clearCart();
          // Redirect to success page after a short delay
          setTimeout(() => {
            router.push(
              `/checkout/success?order_id=${data.orderId || orderIdParam || ""}&ref=${reference}`
            );
          }, 1500);
        } else {
          setState("failed");
          setMessage(data.error || data.message || "Payment was not successful.");
        }
      } catch {
        setState("error");
        setMessage("Could not verify payment. Please contact support.");
      }
    }

    verify();
  }, [searchParams, clearCart, router]);

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="mx-auto max-w-md">
        {state === "loading" && (
          <>
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black dark:border-gray-600 dark:border-t-white" />
            <h1 className="text-2xl font-bold mb-2">Verifying payment...</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment successful!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to the order confirmation...
            </p>
          </>
        )}

        {(state === "failed" || state === "error") && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {state === "failed" ? "Payment failed" : "Something went wrong"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Try again
              </Link>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
              >
                Back to cart
              </Link>
            </div>
            {orderId && (
              <p className="mt-4 text-xs text-gray-500">Order ID: {orderId}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
