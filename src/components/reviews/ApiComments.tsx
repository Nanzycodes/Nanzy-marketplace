"use client";

import {
  getCommentsForPost,
  productIdToPostId,
  type JpComment,
} from "@/lib/api/jsonplaceholder";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { Button } from "@/components/ui/Button";

interface ApiCommentsProps {
  productId: string;
  productName: string;
}

/**
 * Community-style comments from JSONPlaceholder (free, no key).
 * Mapped from productId → postId so each product gets a stable thread.
 */
export default function ApiComments({
  productId,
  productName,
}: ApiCommentsProps) {
  const postId = productIdToPostId(productId);

  const { state, retry } = useAsyncResource(
    (signal) => getCommentsForPost(postId, signal),
    [postId]
  );

  return (
    <section className="mt-12 border-t pt-10 dark:border-gray-800">
      <h2 className="text-xl font-bold mb-1">Community comments</h2>
      <p className="text-xs text-gray-500 mb-6">
        Live data from{" "}
        <a
          href="https://jsonplaceholder.typicode.com"
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          JSONPlaceholder
        </a>{" "}
        (free API · mapped to “{productName}”). Demonstrates parallel free-API
        composition on a product page.
      </p>

      {state.status === "loading" && (
        <div className="text-sm text-gray-500 py-6" role="status">
          Loading comments…
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm" role="alert">
          <p className="text-red-800">{state.error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
            Retry
          </Button>
        </div>
      )}

      {state.status === "success" && state.data.length === 0 && (
        <p className="text-sm text-gray-500">No comments for this thread.</p>
      )}

      {state.status === "success" && state.data.length > 0 && (
        <ul className="space-y-4">
          {state.data.slice(0, 5).map((c: JpComment) => (
            <li
              key={c.id}
              className="rounded-lg border p-4 dark:border-gray-800"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
