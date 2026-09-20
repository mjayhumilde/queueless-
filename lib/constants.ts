export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  JOIN: "/join",
  MONITOR: "/monitor",
} as const;

export const DB_PATHS = {
  queues: "queues",
  queue: (id: string) => `queues/${id}`,
  queueList: (id: string) => `queues/${id}/list`,
  userJoinedQueues: (uid: string) => `users/${uid}/joinedQueues`,
  userJoinedQueue: (uid: string, queueId: string) =>
    `users/${uid}/joinedQueues/${queueId}`,
} as const;

export const QUEUE_STATUS = {
  WAITING: "waiting",
  DONE: "done",
  SKIPPED: "skipped",
} as const;

export const PLANS = {
  FREE: "free",
  BUSINESS: "business",
  PRO: "pro",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

export const PLAN_LIMITS = {
  [PLANS.FREE]: { maxQueues: 1, maxMembers: 20 },
  [PLANS.BUSINESS]: { maxQueues: 5, maxMembers: 100 },
  [PLANS.PRO]: { maxQueues: Infinity, maxMembers: Infinity },
} as const;

export const PLAN_PRICES = {
  [PLANS.BUSINESS]: { amount: 29900, label: "₱299/mo" },
  [PLANS.PRO]: { amount: 79900, label: "₱799/mo" },
} as const;
