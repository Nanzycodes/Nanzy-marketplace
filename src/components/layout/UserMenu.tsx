"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth-actions";
import type { User } from "@supabase/supabase-js";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse hidden sm:block" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white hidden sm:inline-block"
      >
        Login
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Account";

  return (
    <div className="relative group hidden sm:block">
      <button
        type="button"
        className="text-sm font-medium text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white flex items-center gap-1"
        aria-haspopup="menu"
      >
        {displayName}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        role="menu"
        className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-white dark:bg-gray-950 dark:border-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50"
      >
        <div className="py-1">
          <div className="px-4 py-2 text-xs text-gray-500 border-b dark:border-gray-800 truncate">
            {user.email}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
