/**
 * Free Store API client — https://fakestoreapi.com
 * No API key required. Perfect for portfolio / interview demos.
 */
import { fetchJson } from "./http";

export type FakeStoreProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
};

const BASE = "https://fakestoreapi.com";

/** USD → display NGN (approx demo rate; free, no FX API required) */
export const DEMO_USD_TO_NGN = 1600;

export function toNgn(usd: number): number {
  return Math.round(usd * DEMO_USD_TO_NGN);
}

export async function getFakeStoreProducts(
  signal?: AbortSignal
): Promise<FakeStoreProduct[]> {
  return fetchJson<FakeStoreProduct[]>(`${BASE}/products`, { signal });
}

export async function getFakeStoreProduct(
  id: number,
  signal?: AbortSignal
): Promise<FakeStoreProduct> {
  return fetchJson<FakeStoreProduct>(`${BASE}/products/${id}`, { signal });
}

export async function getFakeStoreCategories(
  signal?: AbortSignal
): Promise<string[]> {
  return fetchJson<string[]>(`${BASE}/products/categories`, { signal });
}

export async function getFakeStoreByCategory(
  category: string,
  signal?: AbortSignal
): Promise<FakeStoreProduct[]> {
  return fetchJson<FakeStoreProduct[]>(
    `${BASE}/products/category/${encodeURIComponent(category)}`,
    { signal }
  );
}
