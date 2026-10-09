import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/lib/db/products";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category || "all";
  const products = await getProducts(category === "all" ? undefined : category);

  const categoryLabels: Record<string, string> = {
    all: "All Products",
    men: "Men",
    women: "Women",
    accessories: "Accessories",
    new: "New Arrivals",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {categoryLabels[category] || "Products"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["all", "men", "women", "accessories"].map((cat) => (
          <a
            key={cat}
            href={cat === "all" ? "/products" : `/products?category=${cat}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {categoryLabels[cat]}
          </a>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
