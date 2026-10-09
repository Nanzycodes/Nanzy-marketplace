import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/mock-products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block border rounded-lg overflow-hidden bg-white dark:bg-gray-950 dark:border-gray-800 transition-shadow hover:shadow-md"
    >
      {/* Image placeholder - replace with next/image later */}
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          {product.name}
        </div>
        {/* Sale badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-medium text-white">
            Sale
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-3 right-3 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-sm group-hover:underline line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        {product.colors && product.colors.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {product.colors.length} color{product.colors.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}
