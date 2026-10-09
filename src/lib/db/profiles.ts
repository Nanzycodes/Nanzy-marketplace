"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/marketplace";

type DbProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
};

function mapProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role as UserRole,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    createdAt: row.created_at,
  };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) return null;
    return mapProfile(data as DbProfile);
  } catch {
    return null;
  }
}

export async function requireRole(allowed: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireRole(["admin"]);
    void admin;

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed",
    };
  }
}
