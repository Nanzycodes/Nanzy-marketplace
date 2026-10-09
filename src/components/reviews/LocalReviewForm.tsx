"use client";

import { useState, useTransition } from "react";
import StarRating from "./StarRating";
import { demoSubmitReview } from "@/lib/db/demo-actions";

interface LocalReviewFormProps {
  productId: string;
  productName: string;
}

export default function LocalReviewForm({
  productId,
  productName,
}: LocalReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await demoSubmitReview({
        productId,
        rating,
        comment,
        userName: "Demo Buyer",
      });
      if (result.success) {
        setMessage(
          "Review saved to the database. Check Admin → Reviews and Seller rankings."
        );
        setComment("");
        setRating(5);
      } else {
        setMessage(result.error || "Failed to submit");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 border-t pt-8 space-y-4 max-w-lg"
    >
      <h2 className="text-xl font-bold">Leave a review</h2>
      <p className="text-sm text-gray-500">
        For {productName}. Reviews update seller ratings in the admin dashboard.
      </p>

      {message && (
        <p className="text-sm rounded-md border bg-gray-50 px-3 py-2">{message}</p>
      )}

      <div>
        <p className="text-sm font-medium mb-2">Your rating</p>
        <StarRating
          rating={rating}
          interactive
          size="lg"
          onChange={setRating}
        />
      </div>

      <div>
        <label htmlFor="rev-comment" className="block text-sm font-medium mb-1.5">
          Comment
        </label>
        <textarea
          id="rev-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was the product and seller?"
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white px-5 py-2 rounded-md text-sm font-medium disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
