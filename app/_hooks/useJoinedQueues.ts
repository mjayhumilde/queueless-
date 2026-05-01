import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useJoinedQueues(user: User | null) {
  const [joinedQueues, setJoinedQueues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;

    const joinedRef = ref(db, `users/${user.uid}/joinedQueues`);
    const unsubscribers: (() => void)[] = [];

    const unsubJoined = onValue(joinedRef, (snap) => {
      if (!snap.exists()) {
        setJoinedQueues({});
        return;
      }

      const joinedIds: Record<string, number> = snap.val();

      // Clear previous queue listeners
      unsubscribers.forEach((u) => u());
      unsubscribers.length = 0;

      const results: Record<string, any> = {};

      Object.entries(joinedIds).forEach(([queueId, myNumber]) => {
        const queueRef = ref(db, `queues/${queueId}`);
        const unsubQueue = onValue(queueRef, (qSnap) => {
          if (qSnap.exists()) {
            results[queueId] = { ...qSnap.val(), myNumber };
          } else {
            // Queue was deleted or reset | remove from results
            delete results[queueId];
          }
          setJoinedQueues({ ...results });
        });
        unsubscribers.push(unsubQueue);
      });
    });

    return () => {
      unsubJoined();
      unsubscribers.forEach((u) => u());
    };
  }, [user]);

  return joinedQueues;
}
