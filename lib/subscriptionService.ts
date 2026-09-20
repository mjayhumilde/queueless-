import { ref, get, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { PLANS, PLAN_LIMITS, Plan } from "@/lib/constants";

type UserSubscription = { plan?: unknown; planExpiry?: unknown } | null;

function activePlan(subscription: UserSubscription): Plan {
  const plan = subscription?.plan;
  if (plan !== PLANS.BUSINESS && plan !== PLANS.PRO) return PLANS.FREE;
  const expiry = subscription?.planExpiry;
  if (
    expiry !== undefined &&
    (typeof expiry !== "number" ||
      !Number.isFinite(expiry) ||
      expiry <= Date.now())
  ) {
    return PLANS.FREE;
  }
  return plan;
}

export async function getUserPlan(uid: string): Promise<Plan> {
  const [plan, expiry] = await Promise.all([
    get(ref(db, `users/${uid}/plan`)),
    get(ref(db, `users/${uid}/planExpiry`)),
  ]);
  return activePlan({
    plan: plan.val(),
    planExpiry: expiry.exists() ? expiry.val() : undefined,
  });
}

export function subscribeToUserPlan(
  uid: string,
  onPlan: (plan: Plan) => void,
  onError: (error: Error) => void,
): () => void {
  let expiryTimer: ReturnType<typeof setTimeout> | undefined;
  const subscription: Exclude<UserSubscription, null> = {};
  let planLoaded = false;
  let expiryLoaded = false;
  let failed = false;

  const updatePlan = () => {
    clearTimeout(expiryTimer);
    if (failed || !planLoaded || !expiryLoaded) return;
    onPlan(activePlan(subscription));
    const expiry = subscription.planExpiry;
    if (
      typeof expiry === "number" &&
      Number.isFinite(expiry) &&
      expiry > Date.now()
    ) {
      // Browsers cap timeouts below the duration of a monthly subscription.
      expiryTimer = setTimeout(
        updatePlan,
        Math.min(expiry - Date.now(), 2_147_483_647),
      );
    }
  };
  const handleError = (error: Error) => {
    failed = true;
    clearTimeout(expiryTimer);
    onError(error);
  };

  const unsubscribePlan = onValue(
    ref(db, `users/${uid}/plan`),
    (snapshot) => {
      subscription.plan = snapshot.val();
      planLoaded = true;
      updatePlan();
    },
    handleError,
  );
  const unsubscribeExpiry = onValue(
    ref(db, `users/${uid}/planExpiry`),
    (snapshot) => {
      subscription.planExpiry = snapshot.exists() ? snapshot.val() : undefined;
      expiryLoaded = true;
      updatePlan();
    },
    handleError,
  );

  return () => {
    clearTimeout(expiryTimer);
    unsubscribePlan();
    unsubscribeExpiry();
  };
}

export async function canCreateQueue(
  uid: string,
  currentQueueCount: number,
): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan(uid);
  const limit = PLAN_LIMITS[plan].maxQueues;
  if (currentQueueCount >= limit) {
    return {
      allowed: false,
      reason:
        plan === PLANS.FREE
          ? `Free plan allows 1 queue. Upgrade to create more.`
          : `You've reached the ${limit} queue limit for your plan.`,
    };
  }
  return { allowed: true };
}

export async function canJoinQueue(
  queueMemberCount: number,
  ownerUid: string,
): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan(ownerUid);
  const limit = PLAN_LIMITS[plan].maxMembers;
  if (queueMemberCount >= limit) {
    return {
      allowed: false,
      reason: `This queue is full (${limit} person limit).`,
    };
  }
  return { allowed: true };
}
