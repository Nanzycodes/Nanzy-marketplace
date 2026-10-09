"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** True when free Supabase env is present */
export async function isAuthEnabled(): Promise<boolean> {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Returns the current user or null.
 * Never throws when Supabase is missing (local demo).
 */
export async function getSessionUser() {
  if (!(await isAuthEnabled())) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * When Supabase is configured, require login.
 * When not configured, allow through (portfolio local demo).
 */
export async function requireAuth(returnTo?: string) {
  if (!(await isAuthEnabled())) {
    return null; // demo mode
  }

  const user = await getSessionUser();
  if (!user) {
    const q = returnTo
      ? `?next=${encodeURIComponent(returnTo)}`
      : "";
    redirect(`/auth/login${q}`);
  }
  return user;
}
