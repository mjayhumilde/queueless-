"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function MonitorPage() {
  const params = useSearchParams();
  const queueId = params.get("queueId") ?? "";
  const [queue, setQueue] = useState<any>(null);

  useEffect(() => {
    if (!queueId) return;
    return onValue(ref(db, `queues/${queueId}`), (snap) => {
      if (snap.exists()) setQueue(snap.val());
    });
  }, [queueId]);

  if (!queueId) return <p>Missing ?queueId= in URL</p>;
  if (!queue) return <p>Loading...</p>;

  const waitingList = (Object.values(queue.list ?? {}) as any[]).filter(
    (item) => item.number > queue.current,
  );

  const nextNumber =
    waitingList.length > 0
      ? Math.min(...waitingList.map((item) => item.number))
      : null;

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-1">{queue.name}</h2>

      <p className="text-4xl uppercase tracking-widest text-gray-400 mb-2">
        Now Serving
      </p>
      <p className="text-8xl font-bold">
        {queue.current === 0 ? "—" : queue.current}
      </p>

      <p className="text-3xl uppercase tracking-widest text-gray-400 mt-10 mb-2">
        Next
      </p>
      <p className="text-6xl font-bold">{nextNumber ?? "—"}</p>

      <div className="mt-10 text-center">
        <p className="text-2xl uppercase tracking-widest text-gray-400 mb-3">
          Waiting ({waitingList.length})
        </p>
        {waitingList.length === 0 ? (
          <p className="text-gray-500 text-2xl">No one in queue</p>
        ) : (
          waitingList
            .sort((a, b) => a.number - b.number)
            .slice(0, 5)
            .map((item) => (
              <p key={item.number} className="text-xl">
                {item.number} — {item.name}
              </p>
            ))
        )}
      </div>
    </div>
  );
}
