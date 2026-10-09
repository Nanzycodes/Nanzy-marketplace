import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/db/profiles";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  // Demo mode: if no Supabase / not logged in, still show UI with a banner
  if (profile && profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-2 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Platform control
          </p>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        {!profile && (
          <p className="text-xs rounded-md bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-800">
            Demo mode: connect Supabase + set a user role to{" "}
            <code className="font-mono">admin</code> for real data
          </p>
        )}
      </div>
      <DashboardNav variant="admin" />
      {children}
    </div>
  );
}
