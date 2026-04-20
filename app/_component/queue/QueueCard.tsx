"use client";
import { db } from "@/lib/firebase";
import { ref, get, update, remove, set } from "firebase/database";
import Button from "../ui/Button";

type Props = { queueId: string; queue: any };

export default function QueueCard({ queueId, queue }: Props) {
  const waitingList = (Object.values(queue.list ?? {}) as any[])
    .filter((item) => item.number > queue.current)
    .sort((a, b) => a.number - b.number);

  const waitingCount = waitingList.length;
  const hasWaiting = waitingCount > 0;
  const nextNumber = hasWaiting ? waitingList[0].number : null;

  const callNext = async () => {
    if (!hasWaiting) return;
    const queueRef = ref(db, `queues/${queueId}`);
    const snap = await get(queueRef);
    if (!snap.exists()) return;
    const data = snap.val();
    const entry = Object.entries(data.list ?? {}).find(
      ([, v]: any) => v.number === data.current,
    );
    if (entry)
      await update(ref(db, `queues/${queueId}/list/${entry[0]}`), {
        status: "done",
      });
    await update(queueRef, { current: nextNumber });
  };

  const skipCurrent = async () => {
    if (!hasWaiting || !confirm("Skip current person?")) return;
    const queueRef = ref(db, `queues/${queueId}`);
    const snap = await get(queueRef);
    if (!snap.exists()) return;
    const data = snap.val();
    const entry = Object.entries(data.list ?? {}).find(
      ([, v]: any) => v.number === data.current,
    );
    if (entry)
      await update(ref(db, `queues/${queueId}/list/${entry[0]}`), {
        status: "skipped",
      });
    await update(queueRef, { current: nextNumber });
  };

  const deleteQueue = async () => {
    if (!confirm("Delete this queue?")) return;
    await remove(ref(db, `queues/${queueId}`));
  };

  const resetQueue = async () => {
    if (!confirm("Reset queue? Clears all entries.")) return;
    await set(ref(db, `queues/${queueId}`), {
      name: queue.name,
      ownerId: queue.ownerId,
      ownerName: queue.ownerName,
      current: 0,
      isActive: true,
      createdAt: queue.createdAt,
      list: {},
    });
  };

  const copyJoinLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join?queueId=${queueId}`,
    );
    alert("Join link copied!");
  };

  return (
    <div className="bg-white border border-brand-complementary/12 rounded-2xl p-4 mb-3 transition-all hover:border-brand-complementary/20">
      {/* Top row */}
      <div className="flex justify-between items-start mb-3">
        <p className="font-extrabold text-brand-complementary text-[13px]">
          {queue.name}
        </p>
        <div className="flex gap-1.5">
          <Button onClick={resetQueue} variant="outline" size="sm">
            Reset
          </Button>
          <Button onClick={deleteQueue} variant="danger" size="sm">
            Delete
          </Button>
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-secondary text-brand-complementary">
          Serving: {queue.current === 0 ? "—" : queue.current}
        </span>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-complementary/6 text-brand-complementary border border-brand-complementary/12">
          Waiting: {waitingCount}
        </span>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-complementary/6 text-brand-complementary border border-brand-complementary/12">
          Next: {nextNumber ?? "—"}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-brand-complementary/8 mb-3" />

      {/* Actions */}
      <div className="flex gap-1.5 flex-wrap">
        <Button
          onClick={callNext}
          variant="primary"
          size="sm"
          disabled={!hasWaiting}
        >
          Call Next
        </Button>
        <Button
          onClick={skipCurrent}
          variant="ghost"
          size="sm"
          disabled={!hasWaiting}
        >
          Skip
        </Button>
        <Button onClick={copyJoinLink} variant="ghost" size="sm">
          Copy Link
        </Button>
        <Button
          onClick={() => window.open(`/monitor?queueId=${queueId}`, "_blank")}
          variant="monitor"
          size="sm"
        >
          Monitor
        </Button>
      </div>
    </div>
  );
}
