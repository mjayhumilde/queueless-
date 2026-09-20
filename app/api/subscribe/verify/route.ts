import { NextRequest, NextResponse } from "next/server";
import {
  activateCheckout,
  checkoutCookieName,
  PaymentError,
  paymentErrorResponse,
  requireUserId,
} from "@/lib/server/payments";

export async function POST(req: NextRequest) {
  try {
    const uid = await requireUserId(req);
    const body = await req.json().catch(() => null);
    const sessionId = req.cookies.get(
      checkoutCookieName(body?.checkoutReference),
    )?.value;
    if (!sessionId) {
      throw new PaymentError(
        "No checkout was found in this browser. Start a checkout from Pricing.",
        400,
      );
    }
    const activePlan = await activateCheckout(sessionId, uid);
    if (!activePlan)
      return NextResponse.json({ status: "pending" }, { status: 202 });
    return NextResponse.json({ status: "active", ...activePlan });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
