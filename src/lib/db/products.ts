import { createClient } from "@/lib/supabase/server";
import { Product, DbProduct, mapDbProduct } from "@/types/product";
import {
  mockProducts,
  getProductBySlug as getMockBySlug,
  getProductsByCategory as getMockByCategory,
  getFeaturedProducts as getMockFeatured,
} from "@/lib/mock-products";
import { isLocalMode, localGetProducts } from "@/lib/db/local-store";

/**
 * Fetch products — local demo DB, then Supabase, then mock fallback.
 */
export async function getProducts(category?: string): Promise<Product[]> {
  try {
    if (isLocalMode()) {
      const items = await localGetProducts();
      const list = items as Product[];
      if (category && category !== "all") {
        return list.filter((p) => p.category === category);
      }
      return list;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return category ? getMockByCategory(category) : mockProducts;
    }

    const supabase = await createClient();
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error || !data) {
      return category ? getMockByCategory(category) : mockProducts;
    }

    return (data as DbProduct[]).map(mapDbProduct);
  } catch {
    return category ? getMockByCategory(category) : mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    if (isLocalMode()) {
      const items = await localGetProducts();
      return (items.find((p) => p.slug === slug) as Product) || null;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return getMockBySlug(slug) || null;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      return getMockBySlug(slug) || null;
    }

    return mapDbProduct(data as DbProduct);
  } catch {
    return getMockBySlug(slug) || null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    if (isLocalMode()) {
      const items = await localGetProducts();
      return items.filter((p) => p.featured) as Product[];
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return getMockFeatured();
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return getMockFeatured();
    }

    return (data as DbProduct[]).map(mapDbProduct);
  } catch {
    return getMockFeatured();
  }
}
