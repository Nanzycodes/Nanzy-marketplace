import Link from "next/link";
import Image from "next/image";
import CartBadge from "@/components/layout/CartBadge";
import UserMenu from "@/components/layout/UserMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import MobileNav from "@/components/layout/MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-black/95 dark:border-gray-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Nanzy Clothes home"
        >
          <Image
            src="/nanzy%20logo.jpg"
            alt="Nanzy Clothes"
            width={48}
            height={48}
            priority
            className="h-12 w-12 rounded-full object-cover"
          />
          <span className="whitespace-nowrap text-lg font-bold tracking-tight">
            Nanzy Clothes
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8" aria-label="Primary">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/explore"
            className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Explore API
          </Link>
          <Link
            href="/products?category=men"
            className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Men
          </Link>
          <Link
            href="/products?category=women"
            className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Women
          </Link>
          <Link
            href="/products?category=accessories"
            className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Accessories
          </Link>
        </nav>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <ThemeToggle />
          <Link
            href="/seller/register"
            className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 hidden sm:inline"
          >
            Sell
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 hidden sm:inline"
          >
            Admin
          </Link>
          <UserMenu />
          <CartBadge />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
