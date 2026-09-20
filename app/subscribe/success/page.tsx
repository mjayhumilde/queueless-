"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { PLANS, ROUTES, type Plan } from "@/lib/constants";

type Verification = {
  uid: string;
  attempt: number;
} & ({ status: "active"; plan: Plan } | { status: "error"; message: string });

const MAX_CHECKS = 10;
const CHECK_DELAY_MS = 2_000;

export default function SuccessPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [verification, setVerification] = useState<Verification | null>(null);

  useEffect(() => {
    if (!user) return;
    const checkoutUser = user;
    const controller = new AbortController();

    async function verifyPayment() {
      try {
        const checkoutReference = new URLSearchParams(
          window.location.search,
        ).get("checkout");
        if (!checkoutReference) {
          throw new Error(
            "No checkout reference was found. Start a checkout from Pricing.",
          );
        }
        const token = await checkoutUser.getIdToken();
        for (let check = 0; check < MAX_CHECKS; check++) {
          if (controller.signal.aborted) return;
          const response = await fetch("/api/subscribe/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ checkoutReference }),
            signal: controller.signal,
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(
              result.error ||
                "Unable to verify your payment. Please try again.",
            );
          }
          if (
            result.status === "active" &&
            (result.plan === PLANS.BUSINESS || result.plan === PLANS.PRO)
          ) {
            if (!controller.signal.aborted) {
              setVerification({
                uid: checkoutUser.uid,
                attempt,
                status: "active",
                plan: result.plan,
              });
            }
            return;
          }
          if (result.status !== "pending") {
            throw new Error("Unable to verify your payment. Please try again.");
          }
          if (check < MAX_CHECKS - 1) {
            await new Promise((resolve) => setTimeout(resolve, CHECK_DELAY_MS));
          }
        }
        throw new Error(
          "Your payment is still processing. Wait a moment, then check again.",
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setVerification({
            uid: checkoutUser.uid,
            attempt,
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to verify your payment. Please try again.",
          });
        }
      }
    }

    void verifyPayment();
    return () => controller.abort();
  }, [user, attempt]);

  const current =
    verification?.uid === user?.uid && verification?.attempt === attempt
      ? verification
      : null;
  const verified = current?.status === "active";
  const needsSignIn = !authLoading && !user;
  const heading = needsSignIn
    ? "Sign in to confirm your plan"
    : verified
      ? "Payment successful"
      : current?.status === "error"
        ? "Plan activation pending"
        : "Confirming your payment";
  const message = needsSignIn
    ? "Use the account you purchased with, then return to this page to confirm your payment."
    : verified
      ? `Your ${current.plan === PLANS.PRO ? "Pro" : "Business"} plan is active.`
      : current?.status === "error"
        ? current.message
        : "We are checking your payment and applying your plan. This may take a few seconds.";

  return (
    <div className="min-h-screen bg-brand-main flex items-center justify-center px-6">
      <div className="bg-white border border-brand-complementary/12 rounded-2xl p-10 text-center max-w-sm w-full">
        {verified && (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
        <div aria-live="polite">
          <h1 className="text-xl font-extrabold text-brand-complementary mb-2">
            {heading}
          </h1>
          <p className="text-[13px] text-brand-complementary/50 mb-6">
            {message}
          </p>
        </div>
        {current?.status === "error" && !needsSignIn && (
          <button
            onClick={() => setAttempt((value) => value + 1)}
            className="w-full bg-brand-complementary text-brand-main font-bold py-3 rounded-xl hover:opacity-90 mb-3"
          >
            Check payment again
          </button>
        )}
        {(verified || needsSignIn) && (
          <button
            onClick={() =>
              router.push(needsSignIn ? ROUTES.HOME : ROUTES.DASHBOARD)
            }
            className="w-full bg-brand-complementary text-brand-main font-bold py-3 rounded-xl hover:opacity-90"
          >
            {needsSignIn ? "Sign in" : "Go to Dashboard"}
          </button>
        )}
      </div>
    </div>
  );
}
