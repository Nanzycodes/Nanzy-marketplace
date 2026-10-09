import StatCard from "@/components/dashboard/StatCard";
import { getAdminStats, getRecentActivity } from "@/lib/db/admin-stats";
import { getSellerRankings } from "@/lib/db/sellers";
import { formatPrice } from "@/lib/mock-products";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const [stats, activity, rankings] = await Promise.all([
    getAdminStats(),
    getRecentActivity(10),
    getSellerRankings(),
  ]);

  const highRated = rankings.filter((s) => s.avgRating >= 4 && s.reviewCount > 0);
  const lowRated = rankings.filter(
    (s) => s.reviewCount > 0 && s.avgRating > 0 && s.avgRating < 3
  );

  return (
    <div className="space-y-10">
      {/* KPI grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Buyers" value={stats.totalBuyers} />
        <StatCard label="Sellers" value={stats.totalSellers} />
        <StatCard
          label="Active subscribed sellers"
          value={stats.activeSellers}
          tone="good"
        />
        <StatCard
          label="Pending seller approvals"
          value={stats.pendingSellerApprovals}
          tone={stats.pendingSellerApprovals > 0 ? "warn" : "default"}
        />
        <StatCard label="Orders" value={stats.totalOrders} />
        <StatCard
          label="Revenue (paid)"
          value={formatPrice(stats.totalRevenue)}
        />
        <StatCard label="Reviews" value={stats.totalReviews} />
        <StatCard
          label="Platform avg rating"
          value={stats.avgPlatformRating || "—"}
          hint="Across all product reviews"
        />
      </section>

      {/* Seller ranking split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border p-5 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-green-700 dark:text-green-400">
              High-ranking sellers
            </h2>
            <Link href="/admin/sellers" className="text-xs text-gray-500 hover:underline">
              View all
            </Link>
          </div>
          {highRated.length === 0 ? (
            <p className="text-sm text-gray-500">
              No highly rated sellers yet (need reviews ≥ 4★).
            </p>
          ) : (
            <ul className="space-y-3">
              {highRated.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-900 pb-2"
                >
                  <span className="font-medium">{s.storeName}</span>
                  <span>
                    ★ {s.avgRating} · {s.reviewCount} reviews ·{" "}
                    {s.responseRate}% reply
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border p-5 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-red-700 dark:text-red-400">
              Low-ranking sellers
            </h2>
            <Link href="/admin/sellers" className="text-xs text-gray-500 hover:underline">
              Monitor
            </Link>
          </div>
          {lowRated.length === 0 ? (
            <p className="text-sm text-gray-500">
              No low-rated sellers (under 3★) right now.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowRated.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-900 pb-2"
                >
                  <span className="font-medium">{s.storeName}</span>
                  <span>
                    ★ {s.avgRating} · reply rate {s.responseRate}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Activity feed */}
      <section className="rounded-xl border p-5 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent platform activity</h2>
          <Link href="/admin/activity" className="text-xs text-gray-500 hover:underline">
            Full log
          </Link>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-500">
            No activity logged yet. Actions (orders, reviews, subscriptions)
            appear here when Supabase is connected.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {activity.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap gap-x-3 gap-y-1 border-b border-gray-50 dark:border-gray-900 py-2"
              >
                <span className="font-mono text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
                <span className="font-medium">{a.action}</span>
                {a.actorRole && (
                  <span className="text-gray-500">({a.actorRole})</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
