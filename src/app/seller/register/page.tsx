"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAsSeller } from "@/lib/db/sellers";

export default function SellerRegisterPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await registerAsSeller({ storeName, description });
      if (result.success) {
        router.push("/seller/subscribe");
      } else {
        setError(result.error || "Registration failed. Are you logged in?");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Become a seller</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
        Create your store, get a free trial, then subscribe to keep selling.
        Admin approval is required before your store is public.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 border rounded-xl p-6 dark:border-gray-800"
      >
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}{" "}
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          </div>
        )}

        <div>
          <label htmlFor="storeName" className="block text-sm font-medium mb-1.5">
            Store name
          </label>
          <input
            id="storeName"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            placeholder="e.g. Ada Fashion Hub"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            placeholder="What do you sell?"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {isPending ? "Creating store..." : "Register as seller"}
        </button>
      </form>
    </div>
  );
}
