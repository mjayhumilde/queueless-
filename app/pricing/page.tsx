"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PLANS, PLAN_PRICES, ROUTES } from "@/lib/constants";
import { useUserPlan } from "@/app/_hooks/useUserPlan";
import type { Plan } from "@/lib/constants";

const tiers = [
  {
    plan: PLANS.FREE,
    name: "Starter",
    price: "₱0",
    sub: "Forever free",
    features: [
      "1 active queue",
      "20 people per queue",
      "Basic monitor display",
    ],
  },
  {
    plan: PLANS.BUSINESS,
    name: "Business",
    price: PLAN_PRICES[PLANS.BUSINESS].label,
    sub: "For shops & clinics",
    features: [
      "5 active queues",
      "100 people per queue",
      "7-day history",
      "Basic analytics",
    ],
    featured: true,
  },
  {
    plan: PLANS.PRO,
    name: "Pro",
    price: PLAN_PRICES[PLANS.PRO].label,
    sub: "For hospitals & events",
    features: [
      "Unlimited queues",
      "Unlimited per queue",
      "30-day history",
      "Full analytics",
      "Priority queueing",
    ],
  },
];

const planRank: Record<Plan, number> = {
  [PLANS.FREE]: 0,
  [PLANS.BUSINESS]: 1,
  [PLANS.PRO]: 2,
};

function getCtaLabel(tierPlan: Plan, currentPlan: Plan): string {
  if (tierPlan === currentPlan) return "Current plan";
  if (tierPlan === PLANS.FREE) return "Free plan";
  if (planRank[tierPlan] < planRank[currentPlan]) return "Downgrade";
  return tierPlan === PLANS.BUSINESS ? "Upgrade to Business" : "Upgrade to Pro";
}

function isCtaDisabled(tierPlan: Plan, currentPlan: Plan): boolean {
  return (
    tierPlan === currentPlan ||
    tierPlan === PLANS.FREE ||
    planRank[tierPlan] < planRank[currentPlan]
  );
}

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const {
    plan: currentPlan,
    loading: planLoading,
    error: planError,
  } = useUserPlan(user);
  const waitingForPlan = authLoading || planLoading;

  const handleUpgrade = async (plan: Plan) => {
    if (!user) {
      router.push(ROUTES.HOME);
      return;
    }
    if (
      loading ||
      waitingForPlan ||
      planError ||
      isCtaDisabled(plan, currentPlan)
    )
      return;
    setLoading(plan);
    setError("");
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.url !== "string") {
        throw new Error(
          data.error || "Unable to start checkout. Please try again.",
        );
      }
      window.location.href = data.url;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again.",
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-main px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-tertiary mb-2">
            Plans
          </p>
          <h1 className="text-3xl font-extrabold text-brand-complementary">
            Simple pricing
          </h1>
          <p className="text-sm text-brand-complementary/50 mt-2">
            Start free. Upgrade when you need more.
          </p>
          {!waitingForPlan && !planError && currentPlan !== PLANS.FREE && (
            <p className="text-[12px] text-brand-tertiary font-semibold mt-2">
              You&apos;re on the{" "}
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan
            </p>
          )}
        </div>

        {(error || planError) && (
          <p role="alert" className="text-center text-sm text-red-600 mb-6">
            {error || planError}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map((tier) => {
            const isCurrent =
              !waitingForPlan && !planError && tier.plan === currentPlan;
            const disabled = isCtaDisabled(tier.plan as Plan, currentPlan);
            const ctaLabel = waitingForPlan
              ? "Loading..."
              : getCtaLabel(tier.plan as Plan, currentPlan);

            return (
              <div
                key={tier.plan}
                className={`bg-white rounded-2xl p-6 border relative ${
                  isCurrent
                    ? "border-brand-complementary border-2"
                    : tier.featured
                      ? "border-brand-tertiary border-2"
                      : "border-brand-complementary/12"
                }`}
              >
                {/* Badge */}
                {isCurrent ? (
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest
                    bg-brand-complementary text-brand-main px-2.5 py-1 rounded-full mb-3 inline-block"
                  >
                    Your plan
                  </span>
                ) : tier.featured && !isCurrent ? (
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest
                    bg-brand-tertiary text-brand-complementary px-2.5 py-1 rounded-full mb-3 inline-block"
                  >
                    Most popular
                  </span>
                ) : (
                  <div className="mb-6" /> // spacer so cards align
                )}

                <p className="font-extrabold text-brand-complementary text-base">
                  {tier.name}
                </p>
                <p className="text-2xl font-black text-brand-complementary mt-1">
                  {tier.price}
                </p>
                <p className="text-[11px] text-brand-complementary/40 mb-5">
                  {tier.sub}
                </p>

                <div className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-tertiary shrink-0" />
                      <span className="text-[12px] text-brand-complementary/70">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(tier.plan as Plan)}
                  disabled={
                    disabled ||
                    waitingForPlan ||
                    !!planError ||
                    loading !== null
                  }
                  className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${
                      isCurrent
                        ? "bg-brand-complementary/8 text-brand-complementary"
                        : tier.featured && !disabled
                          ? "bg-brand-complementary text-brand-main hover:opacity-90"
                          : "bg-brand-complementary/8 text-brand-complementary hover:bg-brand-complementary/15"
                    }`}
                >
                  {loading === tier.plan ? "Redirecting..." : ctaLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
