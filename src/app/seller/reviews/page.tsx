"use client";

import { useEffect, useState, useTransition } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import StarRating from "@/components/reviews/StarRating";
import {
  demoReplyToReview,
  demoFetchSellerReviews,
} from "@/lib/db/demo-actions";

const HIGH = "store-001";
const LOW = "store-002";

type ReviewRow = {
  id: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reply: { id: string; message: string; createdAt: string } | null;
};

export default function SellerReviewsPage() {
  const [sellerId, setSellerId] = useState(HIGH);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async (id: string) => {
    const data = await demoFetchSellerReviews(id);
    setReviews(data);
  };

  useEffect(() => {
    load(sellerId);
  }, [sellerId]);

  const handleReply = (reviewId: string) => {
    const text = replyText[reviewId]?.trim();
    if (!text) return;

    startTransition(async () => {
      const result = await demoReplyToReview(reviewId, sellerId, text);
      if (result.success) {
        setMessage("Reply saved to our database. Response rate updated.");
        setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
        await load(sellerId);
      } else {
        setMessage(result.error || "Failed");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Customer feedback</h1>
      <p className="text-sm text-gray-500 mb-4">
        Reply to buyer reviews. Admin monitors your <strong>response rate</strong>.
      </p>
      <DashboardNav variant="seller" />

      <div className="mb-6 flex flex-wrap gap-2 items-center text-sm">
        <span className="text-gray-500">Demo as seller:</span>
        <button
          type="button"
          onClick={() => setSellerId(HIGH)}
          className={`rounded-full px-3 py-1 ${
            sellerId === HIGH ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Ada Fashion (high rank)
        </button>
        <button
          type="button"
          onClick={() => setSellerId(LOW)}
          className={`rounded-full px-3 py-1 ${
            sellerId === LOW ? "bg-black text-white" : "bg-gray-100"
          }`}
        >
          Quick Stitch (low rank)
        </button>
      </div>

      {message && (
        <p className="mb-4 text-sm rounded-md border bg-gray-50 px-3 py-2">
          {message}
        </p>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews for this seller.</p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <StarRating rating={r.rating} size="sm" />
                <span className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-medium">
                {r.productName}{" "}
                <span className="text-gray-400 font-normal">· {r.userName}</span>
              </p>
              <p className="mt-2 text-sm text-gray-700">
                {r.comment || <em className="text-gray-400">No comment</em>}
              </p>

              {r.reply ? (
                <div className="mt-3 rounded-md bg-green-50 border border-green-100 p-3 text-sm">
                  <p className="text-xs font-medium text-green-800 mb-1">
                    Your reply
                  </p>
                  <p>{r.reply.message}</p>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Write a professional reply..."
                    value={replyText[r.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [r.id]: e.target.value,
                      }))
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleReply(r.id)}
                    className="bg-black text-white px-4 py-1.5 rounded-md text-sm disabled:opacity-60"
                  >
                    {isPending ? "Saving..." : "Send reply"}
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
