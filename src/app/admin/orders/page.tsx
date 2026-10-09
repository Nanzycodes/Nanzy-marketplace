import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/mock-products";
import { isLocalMode, localGetOrders } from "@/lib/db/local-store";

export default async function AdminOrdersPage() {
  let orders: any[] = [];

  if (isLocalMode()) {
    orders = await localGetOrders();
  } else {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      orders = data || [];
    } catch {
      orders = [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Orders (buying activity)</h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitor purchases across the platform.
          {isLocalMode() && " — Local demo database"}
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500 rounded-xl border p-8 text-center dark:border-gray-800">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment ref</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t dark:border-gray-800">
                  <td className="p-3 text-gray-500">
                    {new Date(o.createdAt || o.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {o.firstName || o.first_name} {o.lastName || o.last_name}
                    <br />
                    <span className="text-xs text-gray-400">{o.email}</span>
                  </td>
                  <td className="p-3 font-medium">{formatPrice(o.total)}</td>
                  <td className="p-3 capitalize">{o.status}</td>
                  <td className="p-3 font-mono text-xs">
                    {o.paymentReference || o.payment_reference || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
