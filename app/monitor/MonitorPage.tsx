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

  if (!queueId || !queue)
    return (
      <div className="min-h-screen bg-brand-complementary flex items-center justify-center">
        <p className="text-brand-secondary/40 text-sm">
          {!queueId ? "Missing queue ID." : "Loading..."}
        </p>
      </div>
    );

  const waitingList = (Object.values(queue.list ?? {}) as any[])
    .filter((item) => item.number > queue.current)
    .sort((a, b) => a.number - b.number);

  const nextNumber = waitingList.length > 0 ? waitingList[0].number : null;

  return (
    <div className="min-h-screen bg-brand-complementary flex flex-col">
      {/* Header */}
      <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-white/8">
        <p className="text-[11px] font-bold uppercase tracking-[.14em] text-brand-secondary/50">
          Queue
        </p>
        <h1 className="text-xl font-extrabold text-brand-main mt-0.5">
          {queue.name}
        </h1>
      </div>

      {/* Main numbers */}
      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-16 px-6 sm:px-10 py-10">
        <div className="text-center sm:text-left mb-10 sm:mb-0">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-brand-secondary/45 mb-3">
            Now Serving
          </p>
          <p className="text-[clamp(96px,25vw,160px)] font-black text-brand-main leading-none tracking-tight">
            {queue.current === 0 ? "—" : queue.current}
          </p>
        </div>

        <div className="hidden sm:block w-px h-32 bg-white/10" />

        <div className="text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-brand-secondary/45 mb-3">
            Next
          </p>
          <p className="text-[clamp(56px,15vw,96px)] font-black text-brand-secondary/70 leading-none tracking-tight">
            {nextNumber ?? "—"}
          </p>
        </div>
      </div>

      {/* Waiting list */}
      <div className="px-6 sm:px-10 pb-10 max-w-md mx-auto w-full">
        <div className="border-t border-white/8 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-brand-secondary/45 mb-4">
            Waiting ({waitingList.length})
          </p>
          {waitingList.length === 0 ? (
            <p className="text-brand-secondary/30 text-sm">No one in queue</p>
          ) : (
            waitingList.slice(0, 5).map((item) => (
              <div
                key={item.number}
                className="flex justify-between items-center py-3 border-b border-white/6"
              >
                <span className="text-[13px] text-brand-secondary/60 truncate mr-4">
                  {item.name}
                </span>
                <span className="text-[14px] font-extrabold text-brand-main shrink-0">
                  {item.number}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
