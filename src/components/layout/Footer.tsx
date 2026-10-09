import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-950 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Nanzy Clothes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stylish clothing for everyone. Quality pieces delivered to your door.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/products" className="hover:text-black dark:hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=men" className="hover:text-black dark:hover:text-white">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products?category=women" className="hover:text-black dark:hover:text-white">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-black dark:hover:text-white">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-black dark:hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/234XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black dark:hover:text-white"
                >
                  WhatsApp Chat
                </a>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-black dark:hover:text-white">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-black dark:hover:text-white">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/auth/login" className="hover:text-black dark:hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-black dark:hover:text-white">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-black dark:hover:text-white">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Nanzy Clothes. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
