"use client";

import { useDemoPersona, type DemoPersona } from "@/context/DemoPersonaContext";
import Link from "next/link";

const options: { id: DemoPersona; href: string; hint: string }[] = [
  { id: "visitor", href: "/", hint: "Browse only" },
  { id: "buyer", href: "/products", hint: "Shop & reviews" },
  { id: "seller", href: "/seller", hint: "Store & feedback" },
  { id: "admin", href: "/admin", hint: "Full control" },
];

export default function PersonaSwitcher() {
  const { persona, setPersona } = useDemoPersona();

  return (
    <div className="fixed bottom-4 left-4 z-[100] max-w-sm rounded-xl border bg-white shadow-lg p-3 text-xs dark:bg-gray-950 dark:border-gray-800">
      <p className="font-semibold mb-1.5 text-gray-800 dark:text-gray-200">
        Live demo · Act as
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <Link
            key={o.id}
            href={o.href}
            onClick={() => setPersona(o.id)}
            className={`rounded-full px-2.5 py-1 border transition-colors ${
              persona === o.id
                ? "bg-black text-white border-black dark:bg-white dark:text-black"
                : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700"
            }`}
            title={o.hint}
          >
            {o.id}
          </Link>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-gray-500">
        Local DB · no cloud keys required
      </p>
    </div>
  );
}
