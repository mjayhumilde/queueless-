import { NextRequest, NextResponse } from "next/server";
import { PLAN_PRICES } from "@/lib/constants";
import { randomUUID } from "node:crypto";
import {
  checkoutCookieName,
  checkPaymentConfiguration,
  isPaidPlan,
  PaymentError,
  paymentErrorResponse,
  paymongoRequest,
  requireUserId,
} from "@/lib/server/payments";

export async function POST(req: NextRequest) {
  try {
    const uid = await requireUserId(req);
    const body = await req.json().catch(() => null);
    const plan = body?.plan;
    if (!isPaidPlan(plan)) throw new PaymentError("Invalid plan.", 400);
    checkPaymentConfiguration();

    // Return to the same origin that owns the checkout cookie, including localhost.
    const origin = req.nextUrl.origin;
    const checkoutReference = randomUUID();
    const session = await paymongoRequest("checkout_sessions", {
      method: "POST",
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [
              {
                currency: "PHP",
                amount: PLAN_PRICES[plan].amount,
                name: `QueueLess ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                quantity: 1,
              },
            ],
            payment_method_types: ["gcash"],
            success_url: `${origin}/subscribe/success?checkout=${checkoutReference}`,
            cancel_url: `${origin}/subscribe/cancel`,
            metadata: { uid, plan },
          },
        },
      }),
    });
    const checkoutUrl = session.attributes.checkout_url;
    if (!checkoutUrl)
      throw new PaymentError("PayMongo did not return a checkout URL.");

    const response = NextResponse.json({ url: checkoutUrl });
    response.cookies.set(checkoutCookieName(checkoutReference), session.id, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/api/subscribe",
      maxAge: 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
