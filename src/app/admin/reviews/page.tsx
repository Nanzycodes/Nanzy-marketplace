import { getAllReviewsForAdmin } from "@/lib/db/admin-stats";
import StarRating from "@/components/reviews/StarRating";
import { isLocalMode } from "@/lib/db/local-store";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Buyer reviews & feedback</h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitor what buyers say and whether sellers replied.
          {isLocalMode() && " · Local database"}
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500 rounded-xl border p-8 text-center">
          No reviews yet.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: any) => {
            const productName = r.products?.name || "Product";
            const storeName = r.products?.sellers?.store_name || "—";
            const reply = r.reply;

            return (
              <article key={r.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <StarRating rating={r.rating} size="sm" />
                  <time className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="text-sm font-medium">
                  {productName}{" "}
                  <span className="text-gray-400 font-normal">
                    · Seller: {storeName}
                  </span>
                </p>
                {r.comment ? (
                  <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-400 italic">
                    No written comment
                  </p>
                )}

                {reply ? (
                  <div className="mt-3 rounded-md bg-green-50 border border-green-100 p-3 text-sm">
                    <p className="text-xs font-medium text-green-800 mb-1">
                      Seller replied
                    </p>
                    <p>{reply.message}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-red-600 font-medium">
                    ⚠ No seller reply yet — hurts response rate
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
