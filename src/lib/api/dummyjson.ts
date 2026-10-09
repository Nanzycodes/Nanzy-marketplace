/**
 * Free DummyJSON API — https://dummyjson.com
 * Secondary catalog + users sample (no key).
 */
import { fetchJson } from "./http";

export type DummyProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
};

type DummyProductsResponse = {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
};

const BASE = "https://dummyjson.com";

export async function getDummyProducts(params?: {
  limit?: number;
  skip?: number;
  q?: string;
  signal?: AbortSignal;
}): Promise<DummyProductsResponse> {
  const limit = params?.limit ?? 20;
  const skip = params?.skip ?? 0;
  const q = params?.q?.trim();

  if (q) {
    return fetchJson<DummyProductsResponse>(
      `${BASE}/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`,
      { signal: params?.signal }
    );
  }

  return fetchJson<DummyProductsResponse>(
    `${BASE}/products?limit=${limit}&skip=${skip}`,
    { signal: params?.signal }
  );
}
