export type UserRole = "admin" | "seller" | "buyer";

export type SubscriptionStatus =
  | "none"
  | "trial"
  | "active"
  | "expired"
  | "cancelled";

export type SubscriptionPlan = "basic" | "pro" | "enterprise";

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description: string;
  logoUrl: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  subscribedAt: string | null;
  subscriptionEndsAt: string | null;
  avgRating: number;
  reviewCount: number;
  totalSales: number;
  responseRate: number;
  isApproved: boolean;
  createdAt: string;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  sellerId: string;
  message: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminStats {
  totalBuyers: number;
  totalSellers: number;
  activeSellers: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  avgPlatformRating: number;
  pendingSellerApprovals: number;
}

export interface SellerRankingRow {
  id: string;
  storeName: string;
  storeSlug: string;
  avgRating: number;
  reviewCount: number;
  responseRate: number;
  totalSales: number;
  subscriptionStatus: SubscriptionStatus;
  isApproved: boolean;
}
