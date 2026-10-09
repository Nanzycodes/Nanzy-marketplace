"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Seller,
  SellerRankingRow,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/types/marketplace";
import {
  isLocalMode,
  localGetSellers,
  localGetRankings,
  localApproveSeller,
  localRegisterSeller,
  localActivateSubscription,
  LOCAL_DEMO_SELLER_ID,
} from "@/lib/db/local-store";

type DbSeller = {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  description: string;
  logo_url: string | null;
  subscription_status: string;
  subscription_plan: string;
  subscribed_at: string | null;
  subscription_ends_at: string | null;
  avg_rating: number;
  review_count: number;
  total_sales: number;
  response_rate: number;
  is_approved: boolean;
  created_at: string;
};

function mapSeller(row: DbSeller): Seller {
  return {
    id: row.id,
    userId: row.user_id,
    storeName: row.store_name,
    storeSlug: row.store_slug,
    description: row.description || "",
    logoUrl: row.logo_url,
    subscriptionStatus: row.subscription_status as SubscriptionStatus,
    subscriptionPlan: row.subscription_plan as SubscriptionPlan,
    subscribedAt: row.subscribed_at,
    subscriptionEndsAt: row.subscription_ends_at,
    avgRating: Number(row.avg_rating) || 0,
    reviewCount: row.review_count || 0,
    totalSales: row.total_sales || 0,
    responseRate: Number(row.response_rate) || 0,
    isApproved: row.is_approved,
    createdAt: row.created_at,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function getSellerByUserId(userId: string): Promise<Seller | null> {
  if (isLocalMode()) {
    const sellers = await localGetSellers();
    return sellers.find((s) => s.userId === userId) || sellers[0] || null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("sellers").select("*").eq("user_id", userId).single();
    if (error || !data) return null;
    return mapSeller(data as DbSeller);
  } catch {
    return null;
  }
}

export async function getDemoSeller(): Promise<Seller | null> {
  if (isLocalMode()) {
    const sellers = await localGetSellers();
    return sellers.find((s) => s.id === LOCAL_DEMO_SELLER_ID) || sellers[0] || null;
  }
  return null;
}

export async function registerAsSeller(input: {
  storeName: string;
  description?: string;
}): Promise<{ success: boolean; sellerId?: string; error?: string }> {
  if (isLocalMode()) {
    return localRegisterSeller(input);
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "You must be logged in" };
    const slug = slugify(input.storeName) + "-" + user.id.slice(0, 6);
    await supabase.from("profiles").update({ role: "seller" }).eq("id", user.id);
    const { data, error } = await supabase
      .from("sellers")
      .insert({
        user_id: user.id,
        store_name: input.storeName,
        store_slug: slug,
        description: input.description || "",
        subscription_status: "trial",
        subscription_plan: "basic",
        subscribed_at: new Date().toISOString(),
        subscription_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_approved: false,
      })
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      actor_role: "seller",
      action: "seller_registered",
      entity_type: "seller",
      entity_id: data.id,
      metadata: { store_name: input.storeName },
    });
    return { success: true, sellerId: data.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Registration failed" };
  }
}

export async function activateSellerSubscription(
  plan: SubscriptionPlan = "basic",
  sellerId?: string
): Promise<{ success: boolean; error?: string }> {
  if (isLocalMode()) {
    await localActivateSubscription(sellerId || LOCAL_DEMO_SELLER_ID, plan);
    return { success: true };
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };
    const ends = new Date();
    ends.setMonth(ends.getMonth() + 1);
    const { error } = await supabase
      .from("sellers")
      .update({
        subscription_status: "active",
        subscription_plan: plan,
        subscribed_at: new Date().toISOString(),
        subscription_ends_at: ends.toISOString(),
      })
      .eq("user_id", user.id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function approveSeller(
  sellerId: string,
  approved: boolean
): Promise<{ success: boolean; error?: string }> {
  if (isLocalMode()) {
    await localApproveSeller(sellerId, approved);
    return { success: true };
  }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return { success: false, error: "Admin only" };
    const { error } = await supabase.from("sellers").update({ is_approved: approved }).eq("id", sellerId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function getSellerRankings(): Promise<SellerRankingRow[]> {
  if (isLocalMode()) return localGetRankings();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sellers")
      .select("id, store_name, store_slug, avg_rating, review_count, response_rate, total_sales, subscription_status, is_approved")
      .order("avg_rating", { ascending: false });
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      storeName: row.store_name,
      storeSlug: row.store_slug,
      avgRating: Number(row.avg_rating) || 0,
      reviewCount: row.review_count || 0,
      responseRate: Number(row.response_rate) || 0,
      totalSales: row.total_sales || 0,
      subscriptionStatus: row.subscription_status as SubscriptionStatus,
      isApproved: row.is_approved,
    }));
  } catch {
    return [];
  }
}

export async function getAllSellers(): Promise<Seller[]> {
  if (isLocalMode()) return localGetSellers();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("sellers").select("*").order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as DbSeller[]).map(mapSeller);
  } catch {
    return [];
  }
}
