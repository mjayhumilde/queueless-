"use client";
import { db } from "@/lib/firebase";
import { ref, get, update, remove } from "firebase/database";
import Button from "../ui/Button";

type Props = {
  queueId: string;
  queue: any;
};

export default function QueueCard({ queueId, queue }: Props) {
  const waitingCount = Object.values(queue.list ?? {}).filter(
    (item: any) => item.number > queue.current,
  ).length;

  const hasWaiting = waitingCount > 0;

  const callNext = async () => {
    if (!hasWaiting) return;
    const queueRef = ref(db, `queues/${queueId}`);
    const snap = await get(queueRef);
    if (!snap.exists()) return;
    await update(queueRef, { current: snap.val().current + 1 });
  };

  const deleteQueue = async () => {
    if (!confirm("Delete this queue?")) return;
    await remove(ref(db, `queues/${queueId}`));
  };

  const copyJoinLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join?queueId=${queueId}`,
    );
    alert("Join link copied!");
  };

  return (
    <div className="border rounded p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold">{queue.name}</p>
          <p className="text-sm text-gray-500">
            Serving: <strong>{queue.current}</strong> · Waiting:{" "}
            <strong>{waitingCount}</strong>
          </p>
        </div>
        <Button onClick={deleteQueue} variant="danger" size="sm">
          Delete
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={callNext}
          variant="success"
          size="sm"
          disabled={!hasWaiting}
        >
          Call Next
        </Button>
        <Button onClick={copyJoinLink} variant="ghost" size="sm">
          Copy Join Link
        </Button>
        <Button
          onClick={() => window.open(`/monitor?queueId=${queueId}`, "_blank")}
          variant="secondary"
          size="sm"
        >
          Monitor
        </Button>
      </div>
    </div>
  );
}
