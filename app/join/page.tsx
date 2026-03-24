"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";

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

export default function JoinPage() {
  const [name, setName] = useState<string>("");
  const [queueNumber, setQueueNumber] = useState<number | null>(null);

  const joinQueue = async (): Promise<void> => {
    try {
      const queueRef = ref(db, "queue/main-queue");
      const snapshot = await get(queueRef);

      if (!snapshot.exists()) {
        alert("Queue not found!");
        return;
      }

      const data = snapshot.val() as QueueData;

      const nextNumber = data.list ? Object.keys(data.list).length + 1 : 1;

      const newItem: QueueItem = {
        name,
        number: nextNumber,
        status: "waiting",
      };

      await update(queueRef, {
        [`list/${nextNumber}`]: newItem,
      });

      setQueueNumber(nextNumber);
    } catch (error) {
      console.error(error);
      alert("Error joining queue");
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl mb-4">Join Queue</h1>

      <input
        className="border p-2"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={joinQueue}
        className="ml-2 bg-green-500 text-white px-4 py-2"
      >
        Join
      </button>

      {queueNumber && (
        <p className="mt-4 text-xl">
          Your Queue Number: <strong>{queueNumber}</strong>
        </p>
      )}
    </div>
  );
}
