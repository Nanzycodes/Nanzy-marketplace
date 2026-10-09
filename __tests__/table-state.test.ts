import { describe, it, expect } from "vitest";
import {
  filterByQuery,
  sortRows,
  paginate,
} from "../src/hooks/useTableState";
import {
  assertCanSell,
  daysRemaining,
  getPlan,
} from "../src/lib/subscription/plans";
import { isSubscriptionActive } from "../src/types/subscription";

describe("filterByQuery", () => {
  const rows = [
    { name: "Ada Fashion Hub" },
    { name: "Quick Stitch Co" },
    { name: "New Vintage Lagos" },
  ];

  it("returns all when query empty", () => {
    expect(filterByQuery(rows, "", (r) => r.name)).toHaveLength(3);
  });

  it("filters case-insensitively", () => {
    const result = filterByQuery(rows, "ada", (r) => r.name);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ada Fashion Hub");
  });
});

describe("sortRows", () => {
  const rows = [
    { name: "B", rating: 2 },
    { name: "A", rating: 5 },
    { name: "C", rating: 3 },
  ];

  it("sorts ascending by rating", () => {
    const sorted = sortRows(rows, "rating", "asc", (r, k) =>
      k === "rating" ? r.rating : r.name
    );
    expect(sorted.map((r) => r.rating)).toEqual([2, 3, 5]);
  });

  it("sorts descending by name", () => {
    const sorted = sortRows(rows, "name", "desc", (r, k) =>
      k === "name" ? r.name : r.rating
    );
    expect(sorted.map((r) => r.name)).toEqual(["C", "B", "A"]);
  });
});

describe("paginate", () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: i }));

  it("returns correct page slice", () => {
    const { pageRows, total, totalPages } = paginate(rows, 2, 10);
    expect(total).toBe(25);
    expect(totalPages).toBe(3);
    expect(pageRows).toHaveLength(10);
    expect(pageRows[0].id).toBe(10);
  });
});

describe("subscription rules", () => {
  it("getPlan returns known plan", () => {
    expect(getPlan("pro")?.name).toBe("Pro");
  });

  it("active and trial can sell", () => {
    expect(assertCanSell("active").ok).toBe(true);
    expect(assertCanSell("trial").ok).toBe(true);
    expect(assertCanSell("expired").ok).toBe(false);
    expect(assertCanSell("none").ok).toBe(false);
  });

  it("isSubscriptionActive", () => {
    expect(isSubscriptionActive("active")).toBe(true);
    expect(isSubscriptionActive("cancelled")).toBe(false);
  });

  it("daysRemaining non-negative", () => {
    const future = new Date(Date.now() + 3 * 86400000).toISOString();
    const days = daysRemaining(future);
    expect(days).toBeGreaterThanOrEqual(2);
  });
});
