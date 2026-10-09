"use client";

import { useCallback, useEffect, useState, useTransition, Suspense } from "react";
import { useTableState } from "@/hooks/useTableState";
import {
  DataTable,
  TableFilterSelect,
  type Column,
} from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Seller } from "@/types/marketplace";
import { approveSeller } from "@/lib/db/sellers";

type Props = {
  initialSellers: Seller[];
};

function SellersTableInner({ initialSellers }: Props) {
  const [sellers, setSellers] = useState(initialSellers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Seller | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const { state, setQuery, setPage, setSort, setFilter } = useTableState({
    defaultPageSize: 10,
    defaultSort: "avgRating",
    filterKeys: ["status", "approved"],
  });

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    // Client uses initial data; retry just clears error and re-syncs
    try {
      setSellers(initialSellers);
      setLoading(false);
    } catch {
      setError("Failed to load sellers");
      setLoading(false);
    }
  }, [initialSellers]);

  useEffect(() => {
    setSellers(initialSellers);
  }, [initialSellers]);

  const columns: Column<Seller>[] = [
    {
      id: "storeName",
      header: "Store",
      sortable: true,
      searchValue: (r) => `${r.storeName} ${r.storeSlug}`,
      sortValue: (r) => r.storeName.toLowerCase(),
      cell: (r) => <span className="font-medium">{r.storeName}</span>,
    },
    {
      id: "avgRating",
      header: "Rating",
      sortable: true,
      sortValue: (r) => r.avgRating,
      searchValue: (r) => String(r.avgRating),
      cell: (r) => (
        <span
          className={
            r.avgRating >= 4
              ? "text-green-700"
              : r.avgRating > 0 && r.avgRating < 3
                ? "text-red-600"
                : ""
          }
        >
          ★ {r.avgRating || "—"}
        </span>
      ),
    },
    {
      id: "reviewCount",
      header: "Reviews",
      sortable: true,
      sortValue: (r) => r.reviewCount,
      cell: (r) => r.reviewCount,
    },
    {
      id: "responseRate",
      header: "Reply %",
      sortable: true,
      sortValue: (r) => r.responseRate,
      cell: (r) => (
        <span className={r.responseRate < 50 ? "text-red-600 font-medium" : ""}>
          {r.responseRate}%
        </span>
      ),
    },
    {
      id: "subscriptionStatus",
      header: "Subscription",
      sortable: true,
      sortValue: (r) => r.subscriptionStatus,
      searchValue: (r) => `${r.subscriptionStatus} ${r.subscriptionPlan}`,
      cell: (r) => (
        <span className="capitalize">
          {r.subscriptionStatus}
          <span className="text-gray-400"> · {r.subscriptionPlan}</span>
        </span>
      ),
    },
    {
      id: "isApproved",
      header: "Approved",
      sortable: true,
      sortValue: (r) => (r.isApproved ? 1 : 0),
      cell: (r) =>
        r.isApproved ? (
          <span className="text-green-700">Yes</span>
        ) : (
          <span className="text-amber-600">Pending</span>
        ),
    },
  ];

  const filteredBySelect = sellers.filter((s) => {
    const status = state.filters.status;
    const approved = state.filters.approved;
    if (status && s.subscriptionStatus !== status) return false;
    if (approved === "yes" && !s.isApproved) return false;
    if (approved === "no" && s.isApproved) return false;
    return true;
  });

  const handleApprove = (seller: Seller, approved: boolean) => {
    startTransition(async () => {
      const result = await approveSeller(seller.id, approved);
      if (result.success) {
        setSellers((prev) =>
          prev.map((s) =>
            s.id === seller.id ? { ...s, isApproved: approved } : s
          )
        );
        toast({
          title: approved ? "Seller approved" : "Marked pending",
          description: seller.storeName,
          tone: "success",
        });
        setSelected(null);
      } else {
        toast({
          title: "Action failed",
          description: result.error,
          tone: "error",
        });
      }
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredBySelect}
        getRowId={(r) => r.id}
        query={state.q}
        onQueryChange={setQuery}
        sort={state.sort}
        dir={state.dir}
        onSortChange={setSort}
        page={state.page}
        pageSize={state.pageSize}
        onPageChange={setPage}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="No sellers match"
        emptyDescription="Clear filters or wait for new registrations."
        onRowOpen={setSelected}
        filters={
          <>
            <TableFilterSelect
              label="Subscription"
              value={state.filters.status || ""}
              onChange={(v) => setFilter("status", v)}
              options={[
                { value: "trial", label: "Trial" },
                { value: "active", label: "Active" },
                { value: "expired", label: "Expired" },
                { value: "none", label: "None" },
              ]}
            />
            <TableFilterSelect
              label="Approved"
              value={state.filters.approved || ""}
              onChange={(v) => setFilter("approved", v)}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "Pending" },
              ]}
            />
          </>
        }
        rowActions={(row) => (
          <div className="flex gap-2">
            {!row.isApproved && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => handleApprove(row, true)}
              >
                Approve
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelected(row)}
            >
              View
            </Button>
          </div>
        )}
      />

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.storeName || "Seller"}
        size="md"
        footer={
          selected && !selected.isApproved ? (
            <Button
              loading={isPending}
              onClick={() => selected && handleApprove(selected, true)}
            >
              Approve seller
            </Button>
          ) : undefined
        }
      >
        {selected && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Slug</dt>
              <dd className="font-mono text-xs">{selected.storeSlug}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Rating</dt>
              <dd>
                ★ {selected.avgRating} ({selected.reviewCount} reviews)
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Reply rate</dt>
              <dd>{selected.responseRate}%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Sales</dt>
              <dd>{selected.totalSales}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Subscription</dt>
              <dd className="capitalize">
                {selected.subscriptionStatus} · {selected.subscriptionPlan}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Approved</dt>
              <dd>{selected.isApproved ? "Yes" : "Pending"}</dd>
            </div>
            {selected.description && (
              <div>
                <dt className="text-gray-500 mb-1">Description</dt>
                <dd>{selected.description}</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </>
  );
}

export default function SellersTable(props: Props) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading table…</p>}>
      <SellersTableInner {...props} />
    </Suspense>
  );
}
