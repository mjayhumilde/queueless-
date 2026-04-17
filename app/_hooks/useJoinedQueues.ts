import { useEffect, useState } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useJoinedQueues(user: User | null) {
  const [joinedQueues, setJoinedQueues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    return onValue(ref(db, `users/${user.uid}/joinedQueues`), async (snap) => {
      if (!snap.exists()) {
        setJoinedQueues({});
        return;
      }
      const joinedIds: Record<string, number> = snap.val();
      const results: Record<string, any> = {};
      await Promise.all(
        Object.entries(joinedIds).map(async ([queueId, myNumber]) => {
          const qSnap = await get(ref(db, `queues/${queueId}`));
          if (qSnap.exists()) {
            results[queueId] = { ...qSnap.val(), myNumber };
          }
        }),
      );
      setJoinedQueues(results);
    });
  }, [user]);

  return joinedQueues;
}
