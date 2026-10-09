"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const reference = searchParams.get("ref");
  const simulated = searchParams.get("simulated");

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="mx-auto max-w-md">
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

        <h1 className="text-3xl font-bold mb-3">Order placed!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Thank you for shopping with Nanzy Clothes.
          {simulated
            ? " (Simulated success — add Paystack keys for real payments.)"
            : " You will receive a confirmation email shortly."}
        </p>

        {(orderId || reference) && (
          <div className="mb-8 rounded-lg border bg-gray-50 dark:bg-gray-950 dark:border-gray-800 p-4 text-left text-sm space-y-1">
            {orderId && (
              <p>
                <span className="text-gray-500">Order ID:</span>{" "}
                <span className="font-mono">{orderId}</span>
              </p>
            )}
            {reference && (
              <p>
                <span className="text-gray-500">Payment ref:</span>{" "}
                <span className="font-mono">{reference}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
