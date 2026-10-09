"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mock-products";

export default function CartPage() {
  const {
    items,
    isHydrated,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-100 dark:bg-gray-900 rounded-lg" />
          <div className="h-24 bg-gray-100 dark:bg-gray-900 rounded-lg" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
        <div className="border rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-950 dark:border-gray-800 mt-8">
          <p className="text-lg mb-2">Your cart is empty</p>
          <p className="text-sm text-gray-500 mb-6">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Your Cart ({itemCount} item{itemCount !== 1 ? "s" : ""})
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const key = `${item.product.id}-${item.size || ""}-${item.color || ""}`;
            return (
              <div
                key={key}
                className="flex gap-4 border rounded-lg p-4 dark:border-gray-800"
              >
                {/* Thumbnail placeholder */}
                <div className="h-24 w-20 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center text-xs text-gray-400 text-center p-1">
                  {item.product.name}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-medium hover:underline line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1 space-x-2">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <p className="font-semibold mt-1">
                    {formatPrice(item.product.price)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border rounded-md dark:border-gray-700">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                            item.size,
                            item.color
                          )
                        }
                        className="px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity + 1,
                            item.size,
                            item.color
                          )
                        }
                        className="px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(item.product.id, item.size, item.color)
                      }
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right font-semibold">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-24 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="text-gray-500">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t my-4 dark:border-gray-800" />

            <div className="flex justify-between font-semibold text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center rounded-md bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/products"
              className="block w-full text-center mt-3 text-sm text-gray-500 hover:text-black dark:hover:text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
