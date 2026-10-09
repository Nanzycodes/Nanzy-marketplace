"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/mock-products";
import AddToCartButton from "@/components/products/AddToCartButton";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.[0]
  );

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl font-semibold">
          {formatPrice(product.price)}
        </span>
        {hasDiscount && (
          <span className="text-lg text-gray-500 line-through">
            {formatPrice(product.compareAtPrice!)}
          </span>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        {product.description}
      </p>

      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">
            Size: <span className="font-normal text-gray-500">{selectedSize}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`h-10 w-12 rounded-md border text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-gray-300 hover:border-black dark:border-gray-700 dark:hover:border-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium mb-3">
            Color: <span className="font-normal text-gray-500">{selectedColor}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  selectedColor === color
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-gray-300 hover:border-black dark:border-gray-700 dark:hover:border-white"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <AddToCartButton
        product={product}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />

      <p className="mt-4 text-xs text-gray-500 capitalize">
        Category: {product.category}
      </p>
    </div>
  );
}
