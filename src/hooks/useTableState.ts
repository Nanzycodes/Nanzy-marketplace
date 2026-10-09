"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SortDir = "asc" | "desc";

export type TableState = {
  q: string;
  page: number;
  pageSize: number;
  sort: string;
  dir: SortDir;
  filters: Record<string, string>;
};

/**
 * URL-synced table state (search, sort, page, filters).
 * Standard pattern for data-heavy admin UIs.
 */
export function useTableState(options?: {
  defaultPageSize?: number;
  defaultSort?: string;
  filterKeys?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultPageSize = options?.defaultPageSize ?? 10;
  const defaultSort = options?.defaultSort ?? "";
  const filterKeys = options?.filterKeys ?? [];

  const state: TableState = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const key of filterKeys) {
      const v = searchParams.get(key);
      if (v) filters[key] = v;
    }
    return {
      q: searchParams.get("q") || "",
      page: Math.max(1, Number(searchParams.get("page") || 1)),
      pageSize: Math.max(
        1,
        Number(searchParams.get("pageSize") || defaultPageSize)
      ),
      sort: searchParams.get("sort") || defaultSort,
      dir: (searchParams.get("dir") as SortDir) || "asc",
      filters,
    };
  }, [searchParams, defaultPageSize, defaultSort, filterKeys]);

  const setParams = useCallback(
    (patch: Partial<TableState> & { filters?: Record<string, string> }) => {
      const params = new URLSearchParams(searchParams.toString());

      const nextQ = patch.q !== undefined ? patch.q : state.q;
      const nextPage = patch.page !== undefined ? patch.page : state.page;
      const nextPageSize =
        patch.pageSize !== undefined ? patch.pageSize : state.pageSize;
      const nextSort = patch.sort !== undefined ? patch.sort : state.sort;
      const nextDir = patch.dir !== undefined ? patch.dir : state.dir;
      const nextFilters = patch.filters !== undefined ? patch.filters : state.filters;

      if (nextQ) params.set("q", nextQ);
      else params.delete("q");

      params.set("page", String(nextPage));
      params.set("pageSize", String(nextPageSize));

      if (nextSort) params.set("sort", nextSort);
      else params.delete("sort");

      if (nextDir) params.set("dir", nextDir);

      for (const key of filterKeys) {
        if (nextFilters[key]) params.set(key, nextFilters[key]);
        else params.delete(key);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, state, filterKeys]
  );

  const setQuery = (q: string) => setParams({ q, page: 1 });
  const setPage = (page: number) => setParams({ page });
  const setSort = (sort: string) => {
    const dir: SortDir =
      state.sort === sort && state.dir === "asc" ? "desc" : "asc";
    setParams({ sort, dir, page: 1 });
  };
  const setFilter = (key: string, value: string) => {
    setParams({
      filters: { ...state.filters, [key]: value },
      page: 1,
    });
  };

  return {
    state,
    setQuery,
    setPage,
    setSort,
    setFilter,
    setParams,
  };
}

/** Pure helpers — easy to unit test */
export function filterByQuery<T>(
  rows: T[],
  q: string,
  getText: (row: T) => string
): T[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) => getText(row).toLowerCase().includes(needle));
}

export function sortRows<T>(
  rows: T[],
  sortKey: string,
  dir: SortDir,
  getValue: (row: T, key: string) => string | number
): T[] {
  if (!sortKey) return rows;
  const copy = [...rows];
  copy.sort((a, b) => {
    const av = getValue(a, sortKey);
    const bv = getValue(b, sortKey);
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
  return copy;
}

export function paginate<T>(
  rows: T[],
  page: number,
  pageSize: number
): { pageRows: T[]; total: number; totalPages: number } {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    pageRows: rows.slice(start, start + pageSize),
    total,
    totalPages,
  };
}
