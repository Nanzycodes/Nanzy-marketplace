"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { getDummyProducts, type DummyProduct } from "@/lib/api/dummyjson";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/mock-products";
import { toNgn } from "@/lib/api/fakestore";

/**
 * DummyJSON free API panel — server-side pagination + search via API query params.
 */
export default function DummyJsonPanel() {
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");
  const [page, setPage] = useState(0);
  const limit = 8;
  const [products, setProducts] = useState<DummyProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(
    (search: string, pageIndex: number) => {
      const controller = new AbortController();
      setStatus("loading");
      setError(null);

      getDummyProducts({
        limit,
        skip: pageIndex * limit,
        q: search || undefined,
        signal: controller.signal,
      })
        .then((res) => {
          if (controller.signal.aborted) return;
          setProducts(res.products);
          setTotal(res.total);
          setStatus("success");
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setStatus("error");
          setError(err instanceof Error ? err.message : "Failed to load");
        });

      return () => controller.abort();
    },
    []
  );

  useEffect(() => {
    const cleanup = load(submittedQ, page);
    return cleanup;
  }, [submittedQ, page, load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSubmittedQ(q.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">DummyJSON catalog</h2>
        <p className="text-sm text-gray-500 mt-1">
          Free API ·{" "}
          <a
            href="https://dummyjson.com"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            dummyjson.com
          </a>{" "}
          — search is sent to the API (<code className="text-xs">?q=</code>),
          not only filtered in the browser.
        </p>
      </div>

      <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <div className="flex-1">
          <Input
            label="Search products"
            placeholder="e.g. phone, lipstick…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" loading={isPending || status === "loading"}>
            Search
          </Button>
        </div>
      </form>

      {status === "loading" && (
        <div className="rounded-xl border p-10 text-center text-sm text-gray-500" role="status">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black mb-2" />
          <p>Fetching from DummyJSON…</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => load(submittedQ, page)}
          >
            Retry
          </Button>
        </div>
      )}

      {status === "success" && products.length === 0 && (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-gray-500">
          No products for “{submittedQ || "all"}”. Try another search.
        </div>
      )}

      {status === "success" && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <article
                key={p.id}
                className="rounded-xl border overflow-hidden dark:border-gray-800 flex flex-col"
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="max-h-full object-contain"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-xs text-gray-500 capitalize">{p.category}</p>
                  <h3 className="font-medium text-sm line-clamp-2 mt-0.5">
                    {p.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {p.brand}
                  </p>
                  <div className="mt-auto pt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {formatPrice(toNgn(p.price))}
                    </span>
                    <span className="text-xs text-gray-500">★ {p.rating}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-500">
              {total} results · page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
