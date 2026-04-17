import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";

export function useMyQueues(user: User | null) {
  const [myQueues, setMyQueues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    return onValue(ref(db, "queues"), (snap) => {
      if (!snap.exists()) {
        setMyQueues({});
        return;
      }
      const all = snap.val();
      const mine = Object.fromEntries(
        Object.entries(all).filter(([, q]: any) => q.ownerId === user.uid),
      );
      setMyQueues(mine);
    });
  }, [user]);

  return myQueues;
}
