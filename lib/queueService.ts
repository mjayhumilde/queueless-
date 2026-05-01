import {
  ref,
  get,
  push,
  set,
  update,
  remove,
  runTransaction,
} from "firebase/database";
import { db } from "@/lib/firebase";
import { DB_PATHS, QUEUE_STATUS } from "@/lib/constants";

export async function joinQueue(
  queueId: string,
  uid: string,
  displayName: string,
): Promise<{ success: boolean; number?: number; error?: string }> {
  const snap = await get(ref(db, DB_PATHS.queue(queueId)));
  if (!snap.exists()) return { success: false, error: "Queue not found." };

  const queueData = snap.val();
  if (queueData.ownerId === uid)
    return { success: false, error: "You can't join your own queue." };

  const already = await get(ref(db, DB_PATHS.userJoinedQueue(uid, queueId)));
  if (already.exists())
    return { success: false, error: "You already joined this queue." };

  let assignedNumber = 0;
  await runTransaction(ref(db, DB_PATHS.queueList(queueId)), (list) => {
    const max = Object.values(list ?? {}).reduce(
      (m: number, i: any) => Math.max(m, i.number ?? 0),
      0,
    );
    assignedNumber = (max as number) + 1;
    return list;
  });

  const entryRef = push(ref(db, DB_PATHS.queueList(queueId)));
  await set(entryRef, {
    name: displayName,
    uid,
    number: assignedNumber,
    status: QUEUE_STATUS.WAITING,
    joinedAt: Date.now(),
  });

  await set(ref(db, DB_PATHS.userJoinedQueue(uid, queueId)), assignedNumber);
  return { success: true, number: assignedNumber };
}

export function extractQueueId(input: string): string {
  try {
    const url = new URL(input.trim());
    return url.searchParams.get("queueId") ?? "";
  } catch {
    return input.trim();
  }
}
