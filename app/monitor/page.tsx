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

  const waiting = Object.values(queue.list ?? {}).filter(
    (item: any) => item.number > queue.current,
  );

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
      <h2 className="text-2xl mb-1">{queue.name}</h2>
      <h1 className="text-4xl mb-4">NOW SERVING</h1>
      <p className="text-8xl font-bold">{queue.current}</p>
      <h2 className="text-3xl mt-10">NEXT</h2>
      <p className="text-6xl">{queue.current + 1}</p>
      <div className="mt-10">
        <h3 className="text-2xl mb-2">Waiting ({(waiting as any[]).length})</h3>
        {(waiting as any[]).slice(0, 5).map((item: any) => (
          <p key={item.number} className="text-xl">
            {item.number} - {item.name}
          </p>
        ))}
      </div>
    </div>
  );
}
