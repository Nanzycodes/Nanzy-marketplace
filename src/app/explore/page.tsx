"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import {
  getFakeStoreProducts,
  toNgn,
  type FakeStoreProduct,
} from "@/lib/api/fakestore";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { useTableState } from "@/hooks/useTableState";
import {
  DataTable,
  TableFilterSelect,
  type Column,
} from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { formatPrice } from "@/lib/mock-products";
import DummyJsonPanel from "@/components/explore/DummyJsonPanel";

function FakeStorePanel() {
  const { state: asyncState, retry } = useAsyncResource(
    (signal) => getFakeStoreProducts(signal),
    []
  );

  const { state, setQuery, setPage, setSort, setFilter } = useTableState({
    defaultPageSize: 8,
    defaultSort: "title",
    filterKeys: ["category"],
  });

  const [selected, setSelected] = useState<FakeStoreProduct | null>(null);

  const products =
    asyncState.status === "success" ? asyncState.data : ([] as FakeStoreProduct[]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const cat = state.filters.category;
    if (!cat) return products;
    return products.filter((p) => p.category === cat);
  }, [products, state.filters.category]);

  const columns: Column<FakeStoreProduct>[] = [
    {
      id: "title",
      header: "Product",
      sortable: true,
      searchValue: (r) => `${r.title} ${r.description}`,
      sortValue: (r) => r.title.toLowerCase(),
      cell: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.image} alt="" className="h-full w-full object-contain" />
          </div>
          <span className="font-medium line-clamp-1">{r.title}</span>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      sortable: true,
      sortValue: (r) => r.category,
      searchValue: (r) => r.category,
      cell: (r) => (
        <span className="capitalize text-gray-600">{r.category}</span>
      ),
    },
    {
      id: "price",
      header: "Price (NGN)",
      sortable: true,
      sortValue: (r) => r.price,
      cell: (r) => formatPrice(toNgn(r.price)),
    },
    {
      id: "rating",
      header: "Rating",
      sortable: true,
      sortValue: (r) => r.rating.rate,
      cell: (r) => (
        <span>
          ★ {r.rating.rate}{" "}
          <span className="text-gray-400 text-xs">({r.rating.count})</span>
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(r) => String(r.id)}
        query={state.q}
        onQueryChange={setQuery}
        sort={state.sort}
        dir={state.dir}
        onSortChange={setSort}
        page={state.page}
        pageSize={state.pageSize}
        onPageChange={setPage}
        loading={asyncState.status === "loading"}
        error={asyncState.status === "error" ? asyncState.error : null}
        onRetry={retry}
        emptyTitle="No products from API"
        emptyDescription="Check your network or retry."
        onRowOpen={setSelected}
        filters={
          <TableFilterSelect
            label="Category"
            value={state.filters.category || ""}
            onChange={(v) => setFilter("category", v)}
            options={categories.map((c) => ({ value: c, label: c }))}
          />
        }
        rowActions={(row) => (
          <Button size="sm" variant="ghost" onClick={() => setSelected(row)}>
            Details
          </Button>
        )}
      />

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title || "Product"}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.image}
                alt={selected.title}
                className="max-h-full object-contain"
              />
            </div>
            <div className="space-y-3 text-sm">
              <p className="capitalize text-gray-500">{selected.category}</p>
              <p className="text-xl font-semibold">
                {formatPrice(toNgn(selected.price))}
              </p>
              <p>
                ★ {selected.rating.rate} ({selected.rating.count} reviews)
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {selected.description}
              </p>
              <p className="text-xs text-gray-400">
                Source: Fake Store API · id {selected.id}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function ExploreContent() {
  const [tab, setTab] = useState("fakestore");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Frontend skills · free APIs
        </p>
        <h1 className="text-3xl font-bold mt-1">Explore open catalogs</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Two free public APIs, no keys. Same professional patterns: typed
          clients, AbortController, loading / error / retry, search &amp;
          pagination.
        </p>
      </div>

      <Tabs
        className="mb-8"
        items={[
          { id: "fakestore", label: "Fake Store API" },
          { id: "dummyjson", label: "DummyJSON API" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "fakestore" && <FakeStorePanel />}
      {tab === "dummyjson" && <DummyJsonPanel />}

      <p className="mt-10 text-center text-sm text-gray-500">
        <Link href="/products" className="underline">
          Back to Nanzy marketplace products
        </Link>
      </p>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-sm text-gray-500">
          Loading explore…
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
