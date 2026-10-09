import { isAuthEnabled } from "@/lib/auth/guards";
import Link from "next/link";

/** Shows whether free Supabase Auth is active (useful for demos). */
export default async function AuthStatusBanner() {
  const enabled = await isAuthEnabled();

  if (enabled) {
    return (
      <p className="text-xs text-center text-green-700 dark:text-green-400 mb-4">
        Supabase Auth is connected (free tier).
      </p>
    );
  }

  return (
    <p className="text-xs text-center text-amber-700 dark:text-amber-400 mb-4">
      Auth runs in demo mode until you add free Supabase keys. See{" "}
      <Link href="/auth/login" className="underline">
        AUTH.md
      </Link>{" "}
      in the repo.
    </p>
  );
}
