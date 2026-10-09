import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/db/products";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import LocalReviewForm from "@/components/reviews/LocalReviewForm";
import ApiComments from "@/components/reviews/ApiComments";
import { isLocalMode } from "@/lib/db/local-store";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center text-gray-400">
          <span className="text-lg">{product.name}</span>
          <span className="text-sm mt-2">(Product image)</span>
        </div>

        <div>
          <Link
            href="/products"
            className="text-sm text-gray-500 hover:text-black dark:hover:text-white mb-4 inline-block"
          >
            ← Back to products
          </Link>

          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <ProductDetailClient product={product} />
        </div>
      </div>

      {isLocalMode() && (
        <LocalReviewForm productId={product.id} productName={product.name} />
      )}

      {/* Free API: JSONPlaceholder comments */}
      <ApiComments productId={product.id} productName={product.name} />
    </div>
  );
}
