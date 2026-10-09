"use server";

import { createClient } from "@/lib/supabase/server";

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined from auth metadata when available
  user_name?: string;
};

export type ReviewResult = {
  success: boolean;
  error?: string;
  review?: Review;
};

/**
 * Fetch all reviews for a product (newest first).
 */
export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, user_id, rating, comment, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.warn("getReviewsForProduct error:", error?.message);
      return [];
    }

    return data as Review[];
  } catch {
    return [];
  }
}

/**
 * Get average rating + count for a product.
 */
export async function getProductRating(productId: string): Promise<{
  average: number;
  count: number;
}> {
  const reviews = await getReviewsForProduct(productId);
  if (reviews.length === 0) return { average: 0, count: 0 };

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

/**
 * Create or update a review (one per user per product).
 */
export async function submitReview(
  productId: string,
  rating: number,
  comment: string
): Promise<ReviewResult> {
  try {
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to leave a review." };
    }

    // Upsert: one review per user per product
    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        {
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        },
        { onConflict: "product_id,user_id" }
      )
      .select("id, product_id, user_id, rating, comment, created_at")
      .single();

    if (error) {
      console.error("submitReview error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, review: data as Review };
  } catch (err) {
    console.error("submitReview unexpected:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Delete own review.
 */
export async function deleteReview(reviewId: string): Promise<ReviewResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated." };
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete review." };
  }
}
