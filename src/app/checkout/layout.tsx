import { requireAuth } from "@/lib/auth/guards";

/**
 * Checkout: prefer logged-in users when Supabase is on.
 * Guest checkout remains available in local demo (no Supabase keys).
 */
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/checkout");
  return <>{children}</>;
}
