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

  const waitingList = (Object.values(queue.list ?? {}) as any[])
    .filter((item) => item.number > queue.current)
    .sort((a, b) => a.number - b.number);

  const nextNumber = waitingList.length > 0 ? waitingList[0].number : null;

  return (
    <div className="h-screen bg-brand-complementary text-brand-main flex flex-col items-center justify-center px-6">
      <p className="text-brand-secondary text-sm uppercase tracking-widest mb-1">
        {queue.name}
      </p>

      <p className="text-xs uppercase tracking-widest text-brand-secondary/60 mt-8 mb-2">
        Now Serving
      </p>
      <p className="text-9xl font-bold text-brand-main">
        {queue.current === 0 ? "—" : queue.current}
      </p>

      <p className="text-xs uppercase tracking-widest text-brand-secondary/60 mt-10 mb-2">
        Next
      </p>
      <p className="text-6xl font-bold text-brand-secondary">
        {nextNumber ?? "—"}
      </p>

      <div className="mt-12 text-center w-full max-w-xs">
        <p className="text-xs uppercase tracking-widest text-brand-secondary/60 mb-4">
          Waiting ({waitingList.length})
        </p>
        {waitingList.length === 0 ? (
          <p className="text-brand-secondary/50 text-lg">No one in queue</p>
        ) : (
          waitingList.slice(0, 5).map((item) => (
            <div
              key={item.number}
              className="flex justify-between items-center py-2 border-b border-brand-secondary/20"
            >
              <span className="text-brand-secondary/70 text-sm">
                {item.name}
              </span>
              <span className="text-brand-main font-bold">{item.number}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
