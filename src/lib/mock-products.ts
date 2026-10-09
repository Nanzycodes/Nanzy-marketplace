import { Product } from "@/types/product";

/**
 * Mock product data for development.
 * Later we will replace this with real API / database calls.
 */
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Classic White Tee",
    slug: "classic-white-tee",
    description:
      "Premium cotton t-shirt with a relaxed fit. Perfect for everyday wear. Soft, breathable, and built to last.",
    price: 8500,
    compareAtPrice: 12000,
    category: "men",
    images: ["/products/white-tee.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy"],
    inStock: true,
    featured: true,
    createdAt: "2026-09-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Oversized Hoodie",
    slug: "oversized-hoodie",
    description:
      "Cozy oversized hoodie in heavyweight fleece. Drop shoulders, kangaroo pocket, and a soft brushed interior.",
    price: 18500,
    category: "men",
    images: ["/products/hoodie.jpg"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Olive"],
    inStock: true,
    featured: true,
    createdAt: "2026-09-20T10:00:00Z",
  },
  {
    id: "3",
    name: "Linen Summer Dress",
    slug: "linen-summer-dress",
    description:
      "Light and airy linen dress with a flattering silhouette. Ideal for warm days and effortless style.",
    price: 22500,
    compareAtPrice: 28000,
    category: "women",
    images: ["/products/linen-dress.jpg"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Beige", "White", "Sage"],
    inStock: true,
    featured: true,
    createdAt: "2026-09-18T10:00:00Z",
  },
  {
    id: "4",
    name: "High-Waist Trousers",
    slug: "high-waist-trousers",
    description:
      "Tailored high-waist trousers with a clean front and comfortable stretch. Dress them up or down.",
    price: 16500,
    category: "women",
    images: ["/products/trousers.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Camel", "Navy"],
    inStock: true,
    createdAt: "2026-09-22T10:00:00Z",
  },
  {
    id: "5",
    name: "Leather Crossbody Bag",
    slug: "leather-crossbody-bag",
    description:
      "Genuine leather crossbody bag with adjustable strap and multiple compartments. Everyday essential.",
    price: 32000,
    category: "accessories",
    images: ["/products/bag.jpg"],
    colors: ["Brown", "Black"],
    inStock: true,
    featured: true,
    createdAt: "2026-09-10T10:00:00Z",
  },
  {
    id: "6",
    name: "Minimalist Cap",
    slug: "minimalist-cap",
    description:
      "Clean six-panel cap with subtle embroidery. Adjustable strap for the perfect fit.",
    price: 6500,
    category: "accessories",
    images: ["/products/cap.jpg"],
    colors: ["Black", "White", "Khaki"],
    inStock: true,
    createdAt: "2026-09-25T10:00:00Z",
  },
  {
    id: "7",
    name: "Relaxed Denim Jacket",
    slug: "relaxed-denim-jacket",
    description:
      "Classic denim jacket with a modern relaxed fit. Washed for softness and character.",
    price: 27500,
    category: "men",
    images: ["/products/denim-jacket.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Light Blue", "Dark Wash"],
    inStock: true,
    createdAt: "2026-09-12T10:00:00Z",
  },
  {
    id: "8",
    name: "Silk Scarf",
    slug: "silk-scarf",
    description:
      "Luxurious pure silk scarf with hand-rolled edges. A versatile finishing touch for any outfit.",
    price: 14500,
    category: "accessories",
    images: ["/products/scarf.jpg"],
    colors: ["Floral", "Solid Navy", "Abstract"],
    inStock: false,
    createdAt: "2026-09-08T10:00:00Z",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (!category || category === "all") return mockProducts;
  return mockProducts.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return mockProducts.filter((p) => p.featured);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}
