import { getAllSellers } from "@/lib/db/sellers";
import SellersTable from "./SellersTable";

export default async function AdminSellersPage() {
  const sellers = await getAllSellers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Sellers</h2>
        <p className="text-sm text-gray-500 mt-1">
          Search, filter, sort, and paginate. Open a row for details. Approve
          pending stores. URL state is shareable.
        </p>
      </div>
      <SellersTable initialSellers={sellers} />
    </div>
  );
}
