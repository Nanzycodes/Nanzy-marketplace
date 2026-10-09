import { requireAuth } from "@/lib/auth/guards";

/**
 * Seller area: requires Supabase login when Auth is enabled.
 * Local demo (no keys) stays open for portfolio walkthroughs.
 */
export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/seller");
  return <>{children}</>;
}
