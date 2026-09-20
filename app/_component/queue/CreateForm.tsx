"use client";
import { useState } from "react";
import { ref, set, push } from "firebase/database";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { DB_PATHS } from "@/lib/constants";
import { canCreateQueue } from "@/lib/subscriptionService";
import Input from "../ui/input";
import Button from "../ui/Button";

type Props = {
  user: User;
  queueCount: number; // passed from dashboard which already has myQueues
};

export default function CreateForm({ user, queueCount }: Props) {
  const [queueName, setQueueName] = useState("");
  const [error, setError] = useState("");

  const createQueue = async () => {
    if (!queueName.trim()) return;
    setError("");

    const limitCheck = await canCreateQueue(user.uid, queueCount);
    if (!limitCheck.allowed) {
      setError(limitCheck.reason ?? "Limit reached.");
      return;
    }

    const newRef = push(ref(db, DB_PATHS.queues));
    await set(newRef, {
      name: queueName,
      ownerId: user.uid,
      ownerName: user.displayName,
      current: 0,
      isActive: true,
      createdAt: Date.now(),
      list: {},
    });
    setQueueName("");
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={queueName}
          onChange={setQueueName}
          placeholder="Queue name"
          onEnter={createQueue}
        />
        <Button onClick={createQueue} variant="success">
          Create
        </Button>
      </div>
      {error && (
        <p className="text-red-600 text-[11px] mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
}
