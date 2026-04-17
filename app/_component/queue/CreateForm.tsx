"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { ref, set, push } from "firebase/database";
import { User } from "firebase/auth";
import Input from "../ui/input";
import Button from "../ui/Button";

export default function CreateForm({ user }: { user: User }) {
  const [queueName, setQueueName] = useState("");

  const createQueue = async () => {
    if (!queueName.trim()) return;
    const newRef = push(ref(db, "queues"));
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
    <div className="flex gap-2">
      <Input
        value={queueName}
        onChange={setQueueName}
        placeholder="Queue name"
        onEnter={createQueue}
      />
      <Button onClick={createQueue}>Create</Button>
    </div>
  );
}
