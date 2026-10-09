"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  product: Product;
  selectedSize?: string;
  selectedColor?: string;
}

export default function AddToCartButton({
  product,
  selectedSize,
  selectedColor,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    if (!product.inStock) return;

    // Require size if the product has sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }

    addItem(product, 1, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!product.inStock}
      className={`w-full rounded-md py-3 text-sm font-medium transition-colors ${
        added
          ? "bg-green-600 text-white"
          : "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {!product.inStock
        ? "Sold Out"
        : added
          ? "Added to Cart ✓"
          : "Add to Cart"}
    </button>
  );
}
