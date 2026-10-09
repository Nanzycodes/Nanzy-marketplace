/**
 * Local demo database — our own JSON file store.
 * Used when NEXT_PUBLIC_SUPABASE_URL is not set.
 * Perfect for live demos without cloud setup.
 *
 * File: data/demo-db.json
 */

import { promises as fs } from "fs";
import path from "path";
import type {
  AdminStats,
  Profile,
  Seller,
  SellerRankingRow,
  ActivityLog,
  SubscriptionPlan,
} from "@/types/marketplace";
import type { Product } from "@/types/product";

const DB_PATH = path.join(process.cwd(), "data", "demo-db.json");

export type DemoReview = {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  storeName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reply: { id: string; message: string; createdAt: string } | null;
};

export type DemoOrder = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  status: string;
  paymentReference: string | null;
  createdAt: string;
};

export type DemoProduct = Product & { sellerId?: string };

export type DemoDB = {
  profiles: Profile[];
  sellers: Seller[];
  products: DemoProduct[];
  orders: DemoOrder[];
  reviews: DemoReview[];
  activity: ActivityLog[];
};

async function readDB(): Promise<DemoDB> {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DemoDB;
}

async function writeDB(db: DemoDB): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function isLocalMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export async function localGetAdminStats(): Promise<AdminStats> {
  const db = await readDB();
  const paid = db.orders.filter((o) =>
    ["paid", "processing", "shipped", "delivered"].includes(o.status)
  );
  const ratings = db.reviews.map((r) => r.rating);
  const avg =
    ratings.length > 0
      ? Math.round(
          (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
        ) / 10
      : 0;

  return {
    totalBuyers: db.profiles.filter((p) => p.role === "buyer").length,
    totalSellers: db.sellers.length,
    activeSellers: db.sellers.filter(
      (s) => s.subscriptionStatus === "active" && s.isApproved
    ).length,
    totalOrders: db.orders.length,
    totalRevenue: paid.reduce((s, o) => s + o.total, 0),
    totalReviews: db.reviews.length,
    avgPlatformRating: avg,
    pendingSellerApprovals: db.sellers.filter((s) => !s.isApproved).length,
  };
}

export async function localGetSellers(): Promise<Seller[]> {
  const db = await readDB();
  return db.sellers;
}

export async function localGetRankings(): Promise<SellerRankingRow[]> {
  const db = await readDB();
  return [...db.sellers]
    .sort((a, b) => b.avgRating - a.avgRating)
    .map((s) => ({
      id: s.id,
      storeName: s.storeName,
      storeSlug: s.storeSlug,
      avgRating: s.avgRating,
      reviewCount: s.reviewCount,
      responseRate: s.responseRate,
      totalSales: s.totalSales,
      subscriptionStatus: s.subscriptionStatus,
      isApproved: s.isApproved,
    }));
}

export async function localApproveSeller(
  sellerId: string,
  approved: boolean
): Promise<void> {
  const db = await readDB();
  const seller = db.sellers.find((s) => s.id === sellerId);
  if (seller) {
    seller.isApproved = approved;
    db.activity.unshift({
      id: `act-${Date.now()}`,
      actorId: "admin-demo-001",
      actorRole: "admin",
      action: approved ? "seller_approved" : "seller_rejected",
      entityType: "seller",
      entityId: sellerId,
      metadata: {},
      createdAt: new Date().toISOString(),
    });
    await writeDB(db);
  }
}

export async function localGetReviews(): Promise<DemoReview[]> {
  const db = await readDB();
  return db.reviews;
}

export async function localGetReviewsForSeller(
  sellerId: string
): Promise<DemoReview[]> {
  const db = await readDB();
  return db.reviews.filter((r) => r.sellerId === sellerId);
}

export async function localReplyToReview(
  reviewId: string,
  sellerId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const db = await readDB();
  const review = db.reviews.find((r) => r.id === reviewId);
  if (!review) return { success: false, error: "Review not found" };
  if (review.sellerId !== sellerId) {
    return { success: false, error: "Not your review" };
  }

  review.reply = {
    id: `reply-${Date.now()}`,
    message,
    createdAt: new Date().toISOString(),
  };

  // Recalculate response rate for seller
  const sellerReviews = db.reviews.filter((r) => r.sellerId === sellerId);
  const replied = sellerReviews.filter((r) => r.reply).length;
  const seller = db.sellers.find((s) => s.id === sellerId);
  if (seller && sellerReviews.length > 0) {
    seller.responseRate =
      Math.round((1000 * replied) / sellerReviews.length) / 10;
  }

  db.activity.unshift({
    id: `act-${Date.now()}`,
    actorId: seller?.userId || null,
    actorRole: "seller",
    action: "reply_to_review",
    entityType: "review",
    entityId: reviewId,
    metadata: {},
    createdAt: new Date().toISOString(),
  });

  await writeDB(db);
  return { success: true };
}

export async function localGetOrders(): Promise<DemoOrder[]> {
  const db = await readDB();
  return db.orders;
}

export async function localGetActivity(limit = 50): Promise<ActivityLog[]> {
  const db = await readDB();
  return db.activity.slice(0, limit);
}

export async function localGetProducts(sellerId?: string): Promise<DemoProduct[]> {
  const db = await readDB();
  if (sellerId) return db.products.filter((p) => p.sellerId === sellerId);
  return db.products;
}

export async function localAddProduct(
  sellerId: string,
  input: {
    name: string;
    price: number;
    category: string;
    description: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const db = await readDB();
  const slug =
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  db.products.push({
    id: `p-${Date.now()}`,
    name: input.name,
    slug,
    description: input.description,
    price: input.price,
    compareAtPrice: null,
    category: input.category as DemoProduct["category"],
    images: [],
    sizes: ["S", "M", "L"],
    colors: ["Default"],
    inStock: true,
    featured: false,
    sellerId,
    createdAt: new Date().toISOString(),
  });

  db.activity.unshift({
    id: `act-${Date.now()}`,
    actorId: null,
    actorRole: "seller",
    action: "product_created",
    entityType: "product",
    entityId: null,
    metadata: { name: input.name },
    createdAt: new Date().toISOString(),
  });

  await writeDB(db);
  return { success: true };
}

export async function localRegisterSeller(input: {
  storeName: string;
  description?: string;
}): Promise<{ success: boolean; sellerId?: string }> {
  const db = await readDB();
  const id = `store-${Date.now()}`;
  const userId = `seller-local-${Date.now()}`;
  const slug =
    input.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "store";

  db.sellers.push({
    id,
    userId,
    storeName: input.storeName,
    storeSlug: slug + "-" + id.slice(-4),
    description: input.description || "",
    logoUrl: null,
    subscriptionStatus: "trial",
    subscriptionPlan: "basic",
    subscribedAt: new Date().toISOString(),
    subscriptionEndsAt: new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ).toISOString(),
    avgRating: 0,
    reviewCount: 0,
    totalSales: 0,
    responseRate: 100,
    isApproved: false,
    createdAt: new Date().toISOString(),
  });

  db.activity.unshift({
    id: `act-${Date.now()}`,
    actorId: userId,
    actorRole: "seller",
    action: "seller_registered",
    entityType: "seller",
    entityId: id,
    metadata: { store_name: input.storeName },
    createdAt: new Date().toISOString(),
  });

  await writeDB(db);
  return { success: true, sellerId: id };
}

export async function localActivateSubscription(
  sellerId: string,
  plan: SubscriptionPlan
): Promise<void> {
  const db = await readDB();
  const seller = db.sellers.find((s) => s.id === sellerId);
  if (!seller) return;

  const ends = new Date();
  ends.setMonth(ends.getMonth() + 1);

  seller.subscriptionStatus = "active";
  seller.subscriptionPlan = plan;
  seller.subscribedAt = new Date().toISOString();
  seller.subscriptionEndsAt = ends.toISOString();

  db.activity.unshift({
    id: `act-${Date.now()}`,
    actorId: seller.userId,
    actorRole: "seller",
    action: "seller_subscribed",
    entityType: "seller",
    entityId: sellerId,
    metadata: { plan },
    createdAt: new Date().toISOString(),
  });

  await writeDB(db);
}

/** Default demo seller id for local demos without login */
export const LOCAL_DEMO_SELLER_ID = "store-001";
export const LOCAL_DEMO_LOW_SELLER_ID = "store-002";

export async function localCreateOrder(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  items?: { productId: string; name: string; quantity: number }[];
}): Promise<{ success: boolean; orderId: string }> {
  const db = await readDB();
  const orderId = `ord-${Date.now()}`;
  const ref = `DEMO-${Date.now().toString(36).toUpperCase()}`;

  db.orders.unshift({
    id: orderId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    total: input.total,
    subtotal: input.subtotal,
    shippingFee: input.shippingFee,
    status: "paid",
    paymentReference: ref,
    createdAt: new Date().toISOString(),
  });

  // bump seller sales for items if we can match products
  if (input.items) {
    for (const line of input.items) {
      const product = db.products.find((p) => p.id === line.productId);
      if (product?.sellerId) {
        const seller = db.sellers.find((s) => s.id === product.sellerId);
        if (seller) seller.totalSales += line.quantity;
      }
    }
  }

  db.activity.unshift({
    id: `act-${Date.now()}`,
    actorId: "buyer-demo-001",
    actorRole: "buyer",
    action: "order_placed",
    entityType: "order",
    entityId: orderId,
    metadata: { total: input.total, ref },
    createdAt: new Date().toISOString(),
  });

  await writeDB(db);
  return { success: true, orderId };
}

export async function localCreateReview(input: {
  productId: string;
  rating: number;
  comment?: string;
  userName?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Rating must be 1–5" };
  }

  const db = await readDB();
  const product = db.products.find((p) => p.id === input.productId);
  if (!product) return { success: false, error: "Product not found" };

  const seller = product.sellerId
    ? db.sellers.find((s) => s.id === product.sellerId)
    : null;

  const reviewId = `rev-${Date.now()}`;
  db.reviews.unshift({
    id: reviewId,
    productId: product.id,
    productName: product.name,
    sellerId: product.sellerId || "",
    storeName: seller?.storeName || "Store",
    userId: "buyer-demo-001",
    userName: input.userName || "Demo Buyer",
    rating: input.rating,
    comment: input.comment?.trim() || null,
    createdAt: new Date().toISOString(),
    reply: null,
  });

  // refresh seller rating
  if (seller && product.sellerId) {
    const sellerReviews = db.reviews.filter((r) => r.sellerId === product.sellerId);
    const sum = sellerReviews.reduce((a, r) => a + r.rating, 0);
    seller.reviewCount = sellerReviews.length;
    seller.avgRating =
      Math.round((sum / sellerReviews.length) * 10) / 10;
    const replied = sellerReviews.filter((r) => r.reply).length;
    seller.responseRate =
      sellerReviews.length === 0
        ? 100
        : Math.round((1000 * replied) / sellerReviews.length) / 10;
  }

  db.activity.unshift({
    id: `act-${Date.now()}`,
    actorId: "buyer-demo-001",
    actorRole: "buyer",
    action: "review_created",
    entityType: "review",
    entityId: reviewId,
    metadata: { rating: input.rating, product: product.name },
    createdAt: new Date().toISOString(),
  });

  await writeDB(db);
  return { success: true };
}
