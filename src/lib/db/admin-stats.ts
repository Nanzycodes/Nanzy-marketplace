"use server";

import { createClient } from "@/lib/supabase/server";
import type { AdminStats, ActivityLog } from "@/types/marketplace";
import {
  isLocalMode,
  localGetAdminStats,
  localGetActivity,
  localGetReviews,
} from "@/lib/db/local-store";

export async function getAdminStats(): Promise<AdminStats> {
  if (isLocalMode()) {
    return localGetAdminStats();
  }

  const empty: AdminStats = {
    totalBuyers: 0,
    totalSellers: 0,
    activeSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalReviews: 0,
    avgPlatformRating: 0,
    pendingSellerApprovals: 0,
  };

  try {
    const supabase = await createClient();
    const [buyers, sellers, activeSellers, orders, reviews, pending] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "buyer"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "seller"),
        supabase.from("sellers").select("id", { count: "exact", head: true }).eq("subscription_status", "active").eq("is_approved", true),
        supabase.from("orders").select("total, status"),
        supabase.from("reviews").select("rating"),
        supabase.from("sellers").select("id", { count: "exact", head: true }).eq("is_approved", false),
      ]);

    const orderRows = orders.data || [];
    const paidOrders = orderRows.filter((o) =>
      ["paid", "processing", "shipped", "delivered"].includes(o.status)
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const reviewRows = reviews.data || [];
    const avgPlatformRating =
      reviewRows.length > 0
        ? Math.round((reviewRows.reduce((s, r) => s + r.rating, 0) / reviewRows.length) * 10) / 10
        : 0;

    return {
      totalBuyers: buyers.count || 0,
      totalSellers: sellers.count || 0,
      activeSellers: activeSellers.count || 0,
      totalOrders: orderRows.length,
      totalRevenue,
      totalReviews: reviewRows.length,
      avgPlatformRating,
      pendingSellerApprovals: pending.count || 0,
    };
  } catch {
    return empty;
  }
}

export async function getRecentActivity(limit = 20): Promise<ActivityLog[]> {
  if (isLocalMode()) return localGetActivity(limit);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      actorRole: row.actor_role,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      metadata: (row.metadata as Record<string, unknown>) || {},
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getAllReviewsForAdmin() {
  if (isLocalMode()) {
    const reviews = await localGetReviews();
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt,
      product_id: r.productId,
      user_id: r.userId,
      products: {
        name: r.productName,
        seller_id: r.sellerId,
        sellers: { store_name: r.storeName, id: r.sellerId },
      },
      reply: r.reply,
    }));
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, product_id, user_id, products ( name, seller_id, sellers ( store_name, id ) )")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
