"use client";
import { db } from "@/lib/firebase";
import { ref, get, update, remove, set } from "firebase/database";
import Button from "../ui/Button";

type Props = {
  queueId: string;
  queue: any;
};

export default function QueueCard({ queueId, queue }: Props) {
  const waitingList = (Object.values(queue.list ?? {}) as any[])
    .filter((item) => item.number > queue.current)
    .sort((a, b) => a.number - b.number);

  const waitingCount = waitingList.length;
  const hasWaiting = waitingCount > 0;
  const nextNumber = hasWaiting ? waitingList[0].number : null;

  // Advance to next && mark current as done
  const callNext = async () => {
    if (!hasWaiting) return;
    const queueRef = ref(db, `queues/${queueId}`);
    const snap = await get(queueRef);
    if (!snap.exists()) return;
    const data = snap.val();

    // Mark current user = done
    const currentEntry = Object.entries(data.list ?? {}).find(
      ([, v]: any) => v.number === data.current,
    );
    if (currentEntry) {
      await update(ref(db, `queues/${queueId}/list/${currentEntry[0]}`), {
        status: "done",
      });
    }
    await update(queueRef, { current: nextNumber });
  };

  // Skip current, mark as skipped, advance to next
  const skipCurrent = async () => {
    if (!hasWaiting) return;
    if (!confirm("Skip current person?")) return;
    const queueRef = ref(db, `queues/${queueId}`);
    const snap = await get(queueRef);
    if (!snap.exists()) return;
    const data = snap.val();

    const currentEntry = Object.entries(data.list ?? {}).find(
      ([, v]: any) => v.number === data.current,
    );
    if (currentEntry) {
      await update(ref(db, `queues/${queueId}/list/${currentEntry[0]}`), {
        status: "skipped",
      });
    }
    await update(queueRef, { current: nextNumber });
  };

  const deleteQueue = async () => {
    if (!confirm("Delete this queue?")) return;
    await remove(ref(db, `queues/${queueId}`));
  };

  const resetQueue = async () => {
    if (!confirm("Reset queue? This clears all entries and starts from 0."))
      return;
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
    <div className="border rounded p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold">{queue.name}</p>
          <p className="text-sm text-gray-500">
            Serving:{" "}
            <strong>{queue.current === 0 ? "—" : queue.current}</strong>
            {" · "}
            Waiting: <strong>{waitingCount}</strong>
          </p>
          <p className="text-sm text-gray-400 mt-0.5">
            Next: <strong>{nextNumber ?? "—"}</strong>
          </p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Button onClick={deleteQueue} variant="danger" size="sm">
            Delete
          </Button>
          <Button onClick={resetQueue} variant="ghost" size="sm">
            Reset
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mt-3">
        <Button
          onClick={callNext}
          variant="success"
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
