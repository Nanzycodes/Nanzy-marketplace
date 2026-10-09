import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { getFeaturedProducts } from "@/lib/db/products";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gray-100 dark:bg-gray-900 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Style That Speaks
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Discover the latest trends in men&apos;s and women&apos;s fashion.
            Quality pieces designed for everyday confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md bg-black px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/products?category=new"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-900 transition-colors"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Free API showcase */}
      <section className="py-12 border-t dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">Open catalog (free API)</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xl mx-auto">
            Live fetch from Fake Store API — demonstrates client data fetching,
            error/retry, and data-table patterns used in production frontends.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Open Explore →
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Featured</h2>
            <Link
              href="/products"
              className="text-sm font-medium hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Men", href: "/products?category=men", color: "bg-blue-100 dark:bg-blue-950" },
              { name: "Women", href: "/products?category=women", color: "bg-pink-100 dark:bg-pink-950" },
              { name: "Accessories", href: "/products?category=accessories", color: "bg-amber-100 dark:bg-amber-950" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`group relative overflow-hidden rounded-xl ${cat.color} p-8 md:p-12 transition-transform hover:scale-[1.02]`}
              >
                <h3 className="text-xl font-semibold">{cat.name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 group-hover:underline">
                  Explore collection →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlight */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Why Nanzy Clothes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div>
              <div className="text-3xl mb-3">🚚</div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick shipping across Nigeria and beyond.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paystack, cards, and more. Fully protected.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold mb-2">WhatsApp Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chat with us anytime for help or questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
