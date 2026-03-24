"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

type QueueItem = {
  name: string;
  number: number;
  status: "waiting" | "serving" | "done";
};

type QueueData = {
  name: string;
  current: number;
  list: Record<string, QueueItem>;
};

export default function MonitorPage() {
  const [queue, setQueue] = useState<QueueData | null>(null);

  useEffect(() => {
    const queueRef = ref(db, "queue/main-queue");

    const unsubscribe = onValue(queueRef, (snapshot) => {
      if (snapshot.exists()) {
        setQueue(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  if (!queue) return <p>Loading...</p>;

  const current = queue.current;
  const next = current + 1;

  const waitingList = Object.values(queue.list || {}).filter(
    (item) => item.number > current,
  );

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl mb-4">NOW SERVING</h1>
      <p className="text-8xl font-bold">{current}</p>

      <h2 className="text-3xl mt-10">NEXT</h2>
      <p className="text-6xl">{next}</p>

      <div className="mt-10">
        <h3 className="text-2xl mb-2">Waiting List</h3>
        {waitingList.slice(0, 5).map((item) => (
          <p key={item.number} className="text-xl">
            {item.number} - {item.name}
          </p>
        ))}
      </div>
    </div>
  );
}
