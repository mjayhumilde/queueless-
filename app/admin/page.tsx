"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { ref, set, get, update } from "firebase/database";

export default function AdminPage() {
  const [queueName, setQueueName] = useState<string>("");

  const createQueue = async (): Promise<void> => {
    const queueId = "main-queue";

    try {
      await set(ref(db, "queue/" + queueId), {
        name: queueName,
        current: 0,
        list: {},
      });

      alert("Queue Created!");
    } catch (error) {
      console.error(error);
      alert("Error creating queue");
    }
  };

  const next = async (): Promise<void> => {
    const queueRef = ref(db, "queue/main-queue");
    const snapshot = await get(queueRef);

    if (!snapshot.exists()) return;

    const data = snapshot.val();

    await update(queueRef, {
      current: data.current + 1,
    });
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl mb-4">Admin - Create Queue</h1>

      <input
        className="border p-2"
        placeholder="Queue Name"
        value={queueName}
        onChange={(e) => setQueueName(e.target.value)}
      />

      <button
        onClick={createQueue}
        className="ml-2 bg-blue-500 text-white px-4 py-2"
      >
        Create Queue
      </button>
      <button onClick={next} className="bg-red-500 text-white px-4 py-2 ml-2">
        Next
      </button>
    </div>
  );
}
