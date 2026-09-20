import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PLAN_PRICES, PLANS, type Plan } from "../constants";

export const CHECKOUT_COOKIE = "queueless_checkout";
const PLAN_DURATION = 30 * 24 * 60 * 60 * 1000;

export function checkoutCookieName(reference: unknown): string {
  if (
    typeof reference !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      reference,
    )
  ) {
    throw new PaymentError(
      "No valid checkout reference was found. Start a checkout from Pricing.",
      400,
    );
  }
  return `${CHECKOUT_COOKIE}_${reference}`;
}

export class PaymentError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new PaymentError(`Payment setup is missing ${name}.`, 503);
  return value;
}

export function isPaidPlan(plan: unknown): plan is keyof typeof PLAN_PRICES {
  return plan === PLANS.BUSINESS || plan === PLANS.PRO;
}

function validUid(uid: unknown): uid is string {
  return (
    typeof uid === "string" &&
    uid.length > 0 &&
    uid.length <= 128 &&
    !/[.#$\[\]/\u0000-\u001f\u007f]/.test(uid)
  );
}

export function isLiveMode(): boolean {
  const key = requiredEnv("PAYMONGO_SECRET_KEY");
  if (!/^sk_(test|live)_/.test(key)) {
    throw new PaymentError("The PayMongo secret key is invalid.", 503);
  }
  return key.startsWith("sk_live_");
}

export async function requireUserId(request: Request): Promise<string> {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token)
    throw new PaymentError("Sign in to continue with your payment.", 401);

  const apiKey = requiredEnv("NEXT_PUBLIC_FIRE_BASE_API_KEY");
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) {
    throw new PaymentError(
      "Unable to verify your account. Please sign in again.",
      response.status >= 500 ? 502 : 401,
    );
  }
  const data = await response.json();
  const user = data.users?.[0];
  if (!validUid(user?.localId) || user.disabled) {
    throw new PaymentError("Please sign in again to continue.", 401);
  }
  return user.localId;
}

type CheckoutSession = {
  id: string;
  attributes: {
    checkout_url?: string;
    livemode?: boolean;
    status?: string;
    metadata?: { uid?: unknown; plan?: unknown };
    payments?: Array<{
      id: string;
      attributes: {
        status: string;
        amount: number;
        currency: string;
        paid_at: number;
      };
    }>;
  };
};

export async function paymongoRequest(
  path: string,
  init: RequestInit = {},
): Promise<CheckoutSession> {
  isLiveMode();
  const response = await fetch(`https://api.paymongo.com/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(requiredEnv("PAYMONGO_SECRET_KEY") + ":").toString("base64")}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new PaymentError(
      "PayMongo could not process the checkout request. Please try again.",
    );
  }
  const payload = await response.json();
  if (!payload.data?.id || !payload.data?.attributes) {
    throw new PaymentError("PayMongo returned an invalid checkout session.");
  }
  return payload.data;
}

function userUrl(uid: string): URL {
  // Keep the server and browser on the same configured Realtime Database.
  const base = requiredEnv("NEXT_PUBLIC_FIRE_BASE_DATABASE_URL");
  const url = new URL(
    `${base.replace(/\/$/, "")}/users/${encodeURIComponent(uid)}.json`,
  );
  url.searchParams.set("auth", requiredEnv("FIREBASE_DB_SECRET"));
  return url;
}

export function checkPaymentConfiguration(): void {
  isLiveMode();
  userUrl("configuration-check");
}

type StoredUser = Record<string, unknown> & {
  plan?: Plan;
  planExpiry?: number;
  planPaidAt?: number;
  paymongoPaymentId?: string;
};

export type ActivePlan = { plan: Plan; planExpiry: number };

async function savePlan(
  uid: string,
  plan: keyof typeof PLAN_PRICES,
  paymentId: string,
  paidAt: number,
): Promise<ActivePlan> {
  const url = userUrl(uid);
  const planExpiry = paidAt + PLAN_DURATION;
  if (planExpiry <= Date.now()) {
    throw new PaymentError(
      "This payment's 30-day plan has already expired.",
      409,
    );
  }

  // Conditional writes prevent a webhook/redirect race from losing user data or
  // letting a delayed older payment overwrite a newer plan.
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, {
      headers: { "X-Firebase-ETag": "true" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new PaymentError(
        "Unable to read your plan from Firebase. Please retry.",
      );
    const current: StoredUser = (await response.json()) ?? {};
    const etag = response.headers.get("etag");
    if (!etag)
      throw new PaymentError(
        "Firebase could not verify the current plan. Please retry.",
      );

    // PayMongo timestamps have second precision. Keep the higher tier if two
    // purchases share a timestamp, regardless of callback arrival order.
    const keepCurrentAtSameTime =
      current.planPaidAt === paidAt &&
      isPaidPlan(current.plan) &&
      PLAN_PRICES[current.plan].amount >= PLAN_PRICES[plan].amount;
    if (
      (current.paymongoPaymentId === paymentId ||
        (current.planPaidAt ?? 0) > paidAt ||
        keepCurrentAtSameTime) &&
      isPaidPlan(current.plan) &&
      typeof current.planExpiry === "number"
    ) {
      return { plan: current.plan, planExpiry: current.planExpiry };
    }

    const updated = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "if-match": etag },
      body: JSON.stringify({
        ...current,
        plan,
        planExpiry,
        planPaidAt: paidAt,
        paymongoPaymentId: paymentId,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (updated.status === 412) continue;
    if (!updated.ok) {
      throw new PaymentError(
        "Payment confirmed, but your plan could not be saved. Please retry.",
      );
    }
    return { plan, planExpiry };
  }
  throw new PaymentError("Your plan is being updated. Please retry.", 503);
}

export async function activateCheckout(
  sessionId: string,
  expectedUid?: string,
): Promise<ActivePlan | null> {
  if (!/^cs_[a-zA-Z0-9]+$/.test(sessionId)) {
    throw new PaymentError(
      "No valid checkout was found. Start a checkout from Pricing.",
      400,
    );
  }
  const session = await paymongoRequest(`checkout_sessions/${sessionId}`);
  const { uid, plan } = session.attributes.metadata ?? {};
  if (
    session.id !== sessionId ||
    session.attributes.livemode !== isLiveMode()
  ) {
    throw new PaymentError(
      "The checkout does not match this payment environment.",
      400,
    );
  }
  if (!validUid(uid) || !isPaidPlan(plan)) {
    throw new PaymentError(
      "The checkout is missing a valid account or plan.",
      400,
    );
  }
  if (expectedUid && uid !== expectedUid) {
    throw new PaymentError(
      "Sign in with the account that started this checkout.",
      403,
    );
  }
  const payment = session.attributes.payments?.find(
    (entry) => entry.attributes?.status === "paid",
  );
  if (!payment) {
    if (session.attributes.status === "expired") {
      throw new PaymentError(
        "This checkout expired. Start a new checkout from Pricing.",
        409,
      );
    }
    return null;
  }
  if (
    !payment.id ||
    payment.attributes.amount !== PLAN_PRICES[plan].amount ||
    payment.attributes.currency !== "PHP" ||
    !Number.isFinite(payment.attributes.paid_at) ||
    payment.attributes.paid_at <= 0
  ) {
    throw new PaymentError("The payment details do not match this plan.", 400);
  }
  return savePlan(uid, plan, payment.id, payment.attributes.paid_at * 1000);
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
): boolean {
  const secret = requiredEnv("PAYMONGO_WEBHOOK_SECRET");
  const parts = Object.fromEntries(
    signature.split(",").map((part) => part.trim().split("=")),
  );
  const timestamp = parts.t;
  const digest = parts[isLiveMode() ? "li" : "te"];
  if (!/^\d+$/.test(timestamp ?? "") || !/^[a-f0-9]{64}$/i.test(digest ?? ""))
    return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest();
  return timingSafeEqual(expected, Buffer.from(digest, "hex"));
}

export function paymentErrorResponse(error: unknown): Response {
  // Never log fetch errors verbatim: Firebase REST URLs contain the DB secret.
  if (error instanceof PaymentError) {
    console.error(`Payment request failed (${error.status}): ${error.message}`);
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Payment request failed unexpectedly.");
  return Response.json(
    { error: "Unable to process your payment right now. Please retry." },
    { status: 502 },
  );
}
