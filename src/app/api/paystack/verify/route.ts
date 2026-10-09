import { NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/db/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, orderId } = body as {
      reference?: string;
      orderId?: string;
    };

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Reference is required" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Paystack is not configured" },
        { status: 500 }
      );
    }

    const result = await verifyPayment(reference);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Verification failed" },
        { status: 400 }
      );
    }

    // Only mark as paid if Paystack says success
    if (result.status === "success" && orderId) {
      await markOrderPaid(orderId, reference);
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      amount: result.amount,
      reference: result.reference,
      orderId,
    });
  } catch (err) {
    console.error("Paystack verify route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
