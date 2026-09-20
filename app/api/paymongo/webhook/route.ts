import { NextRequest, NextResponse } from "next/server";
import {
  activateCheckout,
  isLiveMode,
  PaymentError,
  paymentErrorResponse,
  verifyWebhookSignature,
} from "@/lib/server/payments";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    if (
      !verifyWebhookSignature(body, req.headers.get("paymongo-signature") ?? "")
    ) {
      throw new PaymentError("Invalid signature.", 401);
    }
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      throw new PaymentError("Invalid webhook payload.", 400);
    }
    const attributes = event?.data?.attributes;
    if (attributes?.livemode !== isLiveMode()) {
      throw new PaymentError(
        "Webhook payment mode does not match this environment.",
        400,
      );
    }
    if (attributes.type === "checkout_session.payment.paid") {
      const sessionId = attributes.data?.id;
      if (typeof sessionId !== "string")
        throw new PaymentError("Missing checkout session.", 400);
      const plan = await activateCheckout(sessionId);
      if (!plan)
        throw new PaymentError(
          "Payment is not confirmed yet. Retry delivery.",
          503,
        );
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    // Non-2xx responses let PayMongo retry failed persistence.
    return paymentErrorResponse(error);
  }
}
