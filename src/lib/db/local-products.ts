"use server";

import {
  isLocalMode,
  localGetProducts,
  type DemoProduct,
} from "@/lib/db/local-store";
import type { Product } from "@/types/product";
import { mockProducts, getProductBySlug as mockBySlug } from "@/lib/mock-products";

export async function getStoreProducts(category?: string): Promise<Product[]> {
  if (isLocalMode()) {
    let items = await localGetProducts();
    if (category && category !== "all") {
      items = items.filter((p) => p.category === category);
    }
    return items as Product[];
  }

  // Fall back to existing Supabase/mock path via mock for safety
  if (category && category !== "all") {
    return mockProducts.filter((p) => p.category === category);
  }
  return mockProducts;
}

export async function getStoreProductBySlug(
  slug: string
): Promise<Product | undefined> {
  if (isLocalMode()) {
    const items = await localGetProducts();
    return items.find((p) => p.slug === slug) as Product | undefined;
  }
  return mockBySlug(slug);
}

export async function getStoreFeatured(): Promise<Product[]> {
  if (isLocalMode()) {
    const items = await localGetProducts();
    return items.filter((p) => p.featured) as Product[];
  }
  return mockProducts.filter((p) => p.featured);
}
