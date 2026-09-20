"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { PLANS, type Plan } from "@/lib/constants";
import { subscribeToUserPlan } from "@/lib/subscriptionService";

type PlanState = {
  uid: string;
  plan: Plan;
  error: string | null;
};

export function useUserPlan(user: User | null) {
  const uid = user?.uid;
  const [state, setState] = useState<PlanState | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserPlan(
      uid,
      (plan) => setState({ uid, plan, error: null }),
      () =>
        setState({
          uid,
          plan: PLANS.FREE,
          error: "Unable to load your plan. Please refresh and try again.",
        }),
    );
  }, [uid]);

  if (!uid) return { plan: PLANS.FREE, loading: false, error: null };
  if (state?.uid !== uid) {
    return { plan: PLANS.FREE, loading: true, error: null };
  }
  return { plan: state.plan, loading: false, error: state.error };
}
