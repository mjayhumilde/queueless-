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
