"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mock-products";
import { demoPlaceOrder } from "@/lib/db/demo-actions";

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, isHydrated, itemCount, subtotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    const shippingFee = subtotal >= 50000 ? 0 : 2500;
    const total = subtotal + shippingFee;

    try {
      // 1) Always record order in our demo/local database (for live admin demo)
      const demo = await demoPlaceOrder({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        total,
        subtotal,
        shippingFee,
        items: items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          quantity: i.quantity,
        })),
      });

      // 2) Try Paystack if configured
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            notes: form.notes || undefined,
          },
          subtotal,
          shippingFee,
          total,
        }),
      });

      const data = await res.json();

      if (data.success && data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }

      // No Paystack (or not configured) — complete with local DB order
      clearCart();
      router.push(
        `/checkout/success?order_id=${demo.orderId || ""}&simulated=1`
      );
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-lg" />
          <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-lg" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Add some items before checking out.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shippingEstimate = subtotal >= 50000 ? 0 : 2500;
  const total = subtotal + shippingEstimate;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Shipping form */}
          <div className="lg:col-span-3 space-y-8">
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Contact */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Contact information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0801 234 5678"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  />
                </div>
              </div>
            </section>

            {/* Shipping address */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Shipping address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium mb-1.5">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street address, apartment, etc."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1.5">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={form.city}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1.5">
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    value={form.state}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  >
                    <option value="">Select state</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja (FCT)</option>
                    <option value="Rivers">Rivers</option>
                    <option value="Kano">Kano</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Delta">Delta</option>
                    <option value="Ogun">Ogun</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium mb-1.5">
                    Order notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special delivery instructions..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6 sticky top-24 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <h2 className="text-lg font-semibold mb-4">
                Order summary ({itemCount} item{itemCount !== 1 ? "s" : ""})
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => {
                  const key = `${item.product.id}-${item.size || ""}-${item.color || ""}`;
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <div className="pr-2">
                        <p className="font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">
                          Qty {item.quantity}
                          {item.size && ` · ${item.size}`}
                          {item.color && ` · ${item.color}`}
                        </p>
                      </div>
                      <span className="flex-shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t dark:border-gray-800 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span>
                    {shippingEstimate === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingEstimate)
                    )}
                  </span>
                </div>
                {subtotal < 50000 && (
                  <p className="text-xs text-gray-500">
                    Add {formatPrice(50000 - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t dark:border-gray-800 my-4" />

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
              >
                {isSubmitting ? "Redirecting to payment..." : "Pay with Paystack"}
              </button>

              <p className="mt-4 text-xs text-center text-gray-500">
                Secure payment powered by Paystack.
                <br />
                You will be redirected to complete payment.
              </p>

              <Link
                href="/cart"
                className="block text-center mt-4 text-sm text-gray-500 hover:text-black dark:hover:text-white"
              >
                ← Return to cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
