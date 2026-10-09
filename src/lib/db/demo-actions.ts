"use server";

import {
  localReplyToReview,
  localAddProduct,
  localGetReviewsForSeller,
  localGetProducts,
  localCreateOrder,
  localCreateReview,
  LOCAL_DEMO_SELLER_ID,
  type DemoReview,
  type DemoProduct,
} from "@/lib/db/local-store";
import { revalidatePath } from "next/cache";

export async function demoReplyToReview(
  reviewId: string,
  sellerId: string,
  message: string
) {
  const result = await localReplyToReview(reviewId, sellerId, message);
  if (result.success) {
    revalidatePath("/seller/reviews");
    revalidatePath("/admin");
    revalidatePath("/admin/sellers");
    revalidatePath("/admin/reviews");
  }
  return result;
}

export async function demoAddProduct(input: {
  name: string;
  price: number;
  category: string;
  description: string;
  sellerId?: string;
}) {
  const result = await localAddProduct(
    input.sellerId || LOCAL_DEMO_SELLER_ID,
    input
  );
  if (result.success) {
    revalidatePath("/seller/products");
    revalidatePath("/admin/activity");
    revalidatePath("/products");
  }
  return result;
}

export async function demoFetchSellerReviews(
  sellerId: string
): Promise<DemoReview[]> {
  return localGetReviewsForSeller(sellerId);
}

export async function demoFetchSellerProducts(
  sellerId: string
): Promise<DemoProduct[]> {
  return localGetProducts(sellerId);
}

export async function demoPlaceOrder(input: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  items?: { productId: string; name: string; quantity: number }[];
}) {
  const result = await localCreateOrder(input);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/activity");
  revalidatePath("/seller");
  return result;
}

export async function demoSubmitReview(input: {
  productId: string;
  rating: number;
  comment?: string;
  userName?: string;
}) {
  const result = await localCreateReview(input);
  if (result.success) {
    revalidatePath("/admin");
    revalidatePath("/admin/reviews");
    revalidatePath("/admin/sellers");
    revalidatePath("/seller/reviews");
    revalidatePath("/seller");
  }
  return result;
}
