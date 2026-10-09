"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/reviews", label: "Reviews & Feedback" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/activity", label: "Activity" },
];

const sellerLinks = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/products", label: "My Products" },
  { href: "/seller/reviews", label: "Customer Feedback" },
  { href: "/seller/subscribe", label: "Subscription" },
];

interface DashboardNavProps {
  variant: "admin" | "seller";
}

export default function DashboardNav({ variant }: DashboardNavProps) {
  const pathname = usePathname();
  const links = variant === "admin" ? adminLinks : sellerLinks;

  return (
    <nav className="flex flex-wrap gap-2 border-b pb-4 mb-8 dark:border-gray-800">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/admin" &&
            link.href !== "/seller" &&
            pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
