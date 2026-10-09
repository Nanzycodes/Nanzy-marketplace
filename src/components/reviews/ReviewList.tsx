"use client";

import { useState, useEffect, useCallback } from "react";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import { getReviewsForProduct, type Review } from "@/lib/db/reviews";
import { createClient } from "@/lib/supabase/client";

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const data = await getReviewsForProduct(productId);
    setReviews(data);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadReviews();

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, [loadReviews]);

  const average =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

  return (
    <section className="mt-16 border-t pt-12 dark:border-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={average} size="sm" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {average} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form */}
        <div className="lg:col-span-1">
          <ReviewForm
            productId={productId}
            isLoggedIn={isLoggedIn}
            onSuccess={loadReviews}
          />
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-gray-100 dark:bg-gray-900 animate-pulse"
                />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No reviews yet. Be the first to share your thoughts!
            </p>
          ) : (
            reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-lg border p-4 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  <time className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
