"use client";

import { useEffect, useState, useTransition } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { demoAddProduct, demoFetchSellerProducts } from "@/lib/db/demo-actions";
import { formatPrice } from "@/lib/mock-products";

const SELLER = "store-001";

type Prod = {
  id: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Prod[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("men");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const data = await demoFetchSellerProducts(SELLER);
    setProducts(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await demoAddProduct({
        name,
        price: Number(price) || 0,
        category,
        description,
        sellerId: SELLER,
      });
      if (result.success) {
        setMsg("Product saved to our local database.");
        setName("");
        setPrice("");
        setDescription("");
        await load();
      } else {
        setMsg(result.error || "Failed");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">My products</h1>
      <p className="text-sm text-gray-500 mb-4">
        Catalogue stored in our demo database (data/demo-db.json).
      </p>
      <DashboardNav variant="seller" />

      <form
        onSubmit={handleAdd}
        className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border p-5"
      >
        <h2 className="md:col-span-2 font-semibold">Add product</h2>
        {msg && <p className="md:col-span-2 text-sm text-green-700">{msg}</p>}
        <input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          placeholder="Price (NGN)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="accessories">Accessories</option>
        </select>
        <input
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="md:col-span-2 bg-black text-white py-2 rounded-md text-sm disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save product"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 capitalize">{p.category}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">{p.inStock ? "In stock" : "Out"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
