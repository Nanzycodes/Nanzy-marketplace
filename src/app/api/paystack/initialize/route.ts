import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db/orders";
import { initializePayment, generateReference } from "@/lib/paystack";
import type { CartItem } from "@/types/product";
import type { ShippingAddress } from "@/types/order";

type Body = {
  items: CartItem[];
  shipping: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    // If Paystack is not configured, fall back to simulated success
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Paystack is not configured. Set PAYSTACK_SECRET_KEY in .env.local",
          simulate: true,
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Body;

    if (!body.items?.length || !body.shipping?.email || !body.total) {
      return NextResponse.json(
        { success: false, error: "Invalid order data" },
        { status: 400 }
      );
    }

    // 1. Create order in database (status: pending)
    const orderResult = await createOrder({
      items: body.items,
      shipping: body.shipping,
      subtotal: body.subtotal,
      shippingFee: body.shippingFee,
      total: body.total,
    });

    if (!orderResult.success || !orderResult.orderId) {
      return NextResponse.json(
        { success: false, error: orderResult.error || "Failed to create order" },
        { status: 500 }
      );
    }

    const orderId = orderResult.orderId;
    const reference = generateReference(orderId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 2. Initialize Paystack payment
    const payment = await initializePayment({
      email: body.shipping.email,
      amount: body.total,
      reference,
      callback_url: `${appUrl}/checkout/verify?order_id=${orderId}`,
      metadata: {
        order_id: orderId,
        customer_name: `${body.shipping.firstName} ${body.shipping.lastName}`,
      },
    });

    if (!payment.success || !payment.authorization_url) {
      return NextResponse.json(
        {
          success: false,
          error: payment.error || "Failed to initialize payment",
          orderId, // order was created but payment failed
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      reference: payment.reference,
      authorization_url: payment.authorization_url,
    });
  } catch (err) {
    console.error("Paystack initialize route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
