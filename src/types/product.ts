export type ProductCategory = "men" | "women" | "accessories" | "new";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in Naira
  compareAtPrice?: number | null;
  category: ProductCategory;
  images: string[];
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

/** Shape that comes back from Supabase (snake_case) */
export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  images: string[];
  sizes: string[] | null;
  colors: string[] | null;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
}

export function mapDbProduct(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compare_at_price,
    category: row.category as ProductCategory,
    images: row.images || [],
    sizes: row.sizes || undefined,
    colors: row.colors || undefined,
    inStock: row.in_stock,
    featured: row.featured,
    createdAt: row.created_at,
  };
}
