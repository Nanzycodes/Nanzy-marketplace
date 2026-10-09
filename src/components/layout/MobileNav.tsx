"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/explore", label: "Explore API" },
  { href: "/products?category=men", label: "Men" },
  { href: "/products?category=women", label: "Women" },
  { href: "/products?category=accessories", label: "Accessories" },
  { href: "/seller/register", label: "Sell" },
  { href: "/admin", label: "Admin" },
  { href: "/auth/login", label: "Login" },
  { href: "/cart", label: "Cart" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-200"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <nav
        id="mobile-nav-panel"
        className={cn(
          "fixed top-0 right-0 z-[70] flex h-full w-[min(100%,20rem)] flex-col border-l bg-white p-6 shadow-xl transition-transform dark:border-gray-800 dark:bg-gray-950",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Mobile"
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="font-bold">Menu</span>
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
