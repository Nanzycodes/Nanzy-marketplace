"use client";

import { useMemo, type ReactNode, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  filterByQuery,
  paginate,
  sortRows,
  type SortDir,
} from "@/hooks/useTableState";

export type Column<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  /** Cell render */
  cell: (row: T) => ReactNode;
  /** Value used for sorting */
  sortValue?: (row: T) => string | number;
  /** Contribute to global search */
  searchValue?: (row: T) => string;
  className?: string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Controlled URL-ish state from parent */
  query: string;
  onQueryChange: (q: string) => void;
  sort: string;
  dir: SortDir;
  onSortChange: (columnId: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Optional filter UI */
  filters?: ReactNode;
  /** Loading / error / empty */
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Row click opens detail */
  onRowOpen?: (row: T) => void;
  /** Row actions menu content */
  rowActions?: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  query,
  onQueryChange,
  sort,
  dir,
  onSortChange,
  page,
  pageSize,
  onPageChange,
  filters,
  loading,
  error,
  onRetry,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting search or filters.",
  onRowOpen,
  rowActions,
  className,
}: DataTableProps<T>) {
  const processed = useMemo(() => {
    const searched = filterByQuery(data, query, (row) =>
      columns
        .map((c) => (c.searchValue ? c.searchValue(row) : ""))
        .join(" ")
    );
    const sorted = sortRows(
      searched,
      sort,
      dir,
      (row, key) => {
        const col = columns.find((c) => c.id === key);
        return col?.sortValue?.(row) ?? "";
      }
    );
    return paginate(sorted, page, pageSize);
  }, [data, query, sort, dir, page, pageSize, columns]);

  const onHeaderKey = (e: KeyboardEvent, colId: string, sortable?: boolean) => {
    if (!sortable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSortChange(colId);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-sm">
          <Input
            label="Search"
            placeholder="Search…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search table"
          />
        </div>
        {filters && <div className="flex flex-wrap gap-2">{filters}</div>}
      </div>

      {/* States */}
      {loading && (
        <div
          className="rounded-xl border p-12 text-center text-sm text-gray-500 dark:border-gray-800"
          role="status"
          aria-live="polite"
        >
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black dark:border-t-white mb-2" />
          <p>Loading…</p>
        </div>
      )}

      {!loading && error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30"
          role="alert"
        >
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Something went wrong
          </p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {!loading && !error && processed.total === 0 && (
        <div className="rounded-xl border border-dashed p-12 text-center dark:border-gray-800">
          <p className="font-medium">{emptyTitle}</p>
          <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
        </div>
      )}

      {!loading && !error && processed.total > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
            <table className="w-full text-sm" role="table">
              <thead className="bg-gray-50 text-left dark:bg-gray-900">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      scope="col"
                      className={cn("p-3 font-medium", col.className)}
                      aria-sort={
                        sort === col.id
                          ? dir === "asc"
                            ? "ascending"
                            : "descending"
                          : col.sortable
                            ? "none"
                            : undefined
                      }
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded"
                          onClick={() => onSortChange(col.id)}
                          onKeyDown={(e) => onHeaderKey(e, col.id, true)}
                        >
                          {col.header}
                          {sort === col.id && (
                            <span aria-hidden>{dir === "asc" ? "↑" : "↓"}</span>
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  ))}
                  {rowActions && <th className="p-3 w-24">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {processed.pageRows.map((row) => {
                  const id = getRowId(row);
                  return (
                    <tr
                      key={id}
                      className={cn(
                        "border-t dark:border-gray-800",
                        onRowOpen &&
                          "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      )}
                      tabIndex={onRowOpen ? 0 : undefined}
                      onClick={() => onRowOpen?.(row)}
                      onKeyDown={(e) => {
                        if (!onRowOpen) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowOpen(row);
                        }
                      }}
                    >
                      {columns.map((col) => (
                        <td key={col.id} className={cn("p-3", col.className)}>
                          {col.cell(row)}
                        </td>
                      ))}
                      {rowActions && (
                        <td
                          className="p-3"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-gray-500">
              {processed.total} result{processed.total !== 1 ? "s" : ""} · page{" "}
              {page} of {processed.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= processed.totalPages}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
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

/** Convenience filter select for toolbars */
export function TableFilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="w-40">
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[{ value: "", label: "All" }, ...options]}
      />
    </div>
  );
}
