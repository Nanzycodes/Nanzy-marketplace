import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
