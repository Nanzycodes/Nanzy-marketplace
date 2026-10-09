/**
 * Paystack helpers (server-side only).
 * Docs: https://paystack.com/docs/api
 */

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not set");
  }
  return key;
}

export type InitializePaymentInput = {
  email: string;
  amount: number; // in Naira (we convert to kobo)
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
};

export type InitializePaymentResult = {
  success: boolean;
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  error?: string;
};

/**
 * Initialize a Paystack transaction.
 * Amount is in Naira — we multiply by 100 for kobo.
 */
export async function initializePayment(
  input: InitializePaymentInput
): Promise<InitializePaymentResult> {
  try {
    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        amount: Math.round(input.amount * 100), // Naira → kobo
        reference: input.reference,
        callback_url: input.callback_url,
        metadata: input.metadata,
        currency: "NGN",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.status) {
      return {
        success: false,
        error: data.message || "Failed to initialize payment",
      };
    }

    return {
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    };
  } catch (err) {
    console.error("Paystack initialize error:", err);
    return { success: false, error: "Payment service unavailable" };
  }
}

export type VerifyPaymentResult = {
  success: boolean;
  status?: string; // "success" | "failed" | "abandoned" etc.
  amount?: number; // in Naira
  reference?: string;
  error?: string;
};

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResult> {
  try {
    const res = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${getSecretKey()}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.status) {
      return {
        success: false,
        error: data.message || "Verification failed",
      };
    }

    return {
      success: true,
      status: data.data.status,
      amount: data.data.amount / 100, // kobo → Naira
      reference: data.data.reference,
    };
  } catch (err) {
    console.error("Paystack verify error:", err);
    return { success: false, error: "Verification service unavailable" };
  }
}

/**
 * Generate a unique payment reference.
 */
export function generateReference(orderId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `NC-${orderId.slice(0, 8)}-${timestamp}-${random}`.toUpperCase();
}
