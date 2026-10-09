"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import StarRating from "./StarRating";
import { submitReview } from "@/lib/db/reviews";

interface ReviewFormProps {
  productId: string;
  isLoggedIn: boolean;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, isLoggedIn, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Sign in to leave a review
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await submitReview(productId, rating, comment);
      if (result.success) {
        setSuccess(true);
        setComment("");
        setRating(5);
        onSuccess?.();
      } else {
        setError(result.error || "Failed to submit review.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-5 dark:border-gray-800">
      <h3 className="font-semibold">Write a review</h3>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300">
          Review submitted. Thank you!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Your rating</label>
        <StarRating
          rating={rating}
          interactive
          size="lg"
          onChange={setRating}
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1.5">
          Comment (optional)
        </label>
        <textarea
          id="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-white"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
      >
        {isPending ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
