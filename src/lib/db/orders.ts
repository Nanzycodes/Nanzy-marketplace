"use server";

import { createClient } from "@/lib/supabase/server";
import { CartItem } from "@/types/product";
import { ShippingAddress } from "@/types/order";

export type CreateOrderInput = {
  items: CartItem[];
  shipping: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
};

export type CreateOrderResult = {
  success: boolean;
  orderId?: string;
  error?: string;
};

/**
 * Create an order + order_items in Supabase.
 * Called from the checkout form (before or after payment).
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email: input.shipping.email,
        phone: input.shipping.phone,
        first_name: input.shipping.firstName,
        last_name: input.shipping.lastName,
        address: input.shipping.address,
        city: input.shipping.city,
        state: input.shipping.state,
        notes: input.shipping.notes || null,
        subtotal: input.subtotal,
        shipping_fee: input.shippingFee,
        total: input.total,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return { success: false, error: orderError?.message || "Failed to create order" };
    }

    // Insert order items
    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      // Order was created but items failed — still return the order id
      return { success: true, orderId: order.id, error: "Order created but items may be incomplete" };
    }

    return { success: true, orderId: order.id };
  } catch (err) {
    console.error("createOrder error:", err);
    return { success: false, error: "Unexpected error creating order" };
  }
}

/**
 * Mark an order as paid (called after successful Paystack webhook / verification)
 */
export async function markOrderPaid(orderId: string, paymentReference: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_reference: paymentReference,
    })
    .eq("id", orderId);

  if (error) {
    console.error("markOrderPaid error:", error);
    return false;
  }
  return true;
}
