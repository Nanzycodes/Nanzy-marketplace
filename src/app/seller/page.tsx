import Link from "next/link";
import { getDemoSeller, getAllSellers } from "@/lib/db/sellers";
import { isLocalMode } from "@/lib/db/local-store";
import StatCard from "@/components/dashboard/StatCard";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function SellerDashboardPage() {
  const seller = isLocalMode()
    ? await getDemoSeller()
    : (await getAllSellers())[0] || null;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Seller portal {isLocalMode() ? "· Local DB demo" : ""}
        </p>
        <h1 className="text-2xl font-bold">
          {seller ? seller.storeName : "Seller dashboard"}
        </h1>
      </div>
      <DashboardNav variant="seller" />

      {!seller ? (
        <div className="rounded-xl border p-6 dark:border-gray-800">
          <p className="text-sm mb-3">No seller profile found.</p>
          <Link
            href="/seller/register"
            className="inline-block bg-black text-white px-5 py-2 rounded-md text-sm dark:bg-white dark:text-black"
          >
            Create store
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Avg rating" value={seller.avgRating || "—"} />
            <StatCard label="Reviews" value={seller.reviewCount} />
            <StatCard
              label="Reply rate"
              value={`${seller.responseRate}%`}
              tone={seller.responseRate < 50 ? "bad" : "good"}
              hint="How often you reply to buyer feedback"
            />
            <StatCard label="Total sales" value={seller.totalSales} />
          </div>

          <div className="rounded-xl border p-5 dark:border-gray-800 space-y-2 text-sm mb-6">
            <p>
              <span className="text-gray-500">Subscription:</span>{" "}
              <span className="capitalize font-medium">
                {seller.subscriptionStatus}
              </span>{" "}
              ({seller.subscriptionPlan})
            </p>
            <p>
              <span className="text-gray-500">Approved by admin:</span>{" "}
              {seller.isApproved ? (
                <span className="text-green-700">Yes</span>
              ) : (
                <span className="text-amber-600">Pending</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/seller/reviews" className="underline">
              Handle customer feedback →
            </Link>
            <Link href="/seller/products" className="underline">
              Manage products →
            </Link>
            <Link href="/seller/subscribe" className="underline">
              Subscription →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
