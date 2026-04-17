"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, push, set } from "firebase/database";
import { User } from "firebase/auth";
import Input from "../ui/input";
import Button from "../ui/Button";

export default function JoinForm({ user }: { user: User }) {
  const [joinLink, setJoinLink] = useState("");
  const [error, setError] = useState("");

  const joinViaLink = async () => {
    setError("");
    if (!joinLink.trim()) return;

    let queueId = joinLink.trim();
    try {
      const url = new URL(joinLink.trim());
      queueId = url.searchParams.get("queueId") ?? "";
    } catch {
      /* raw ID */
    }

    if (!queueId) {
      setError("Invalid link or queue ID.");
      return;
    }

    const snap = await get(ref(db, `queues/${queueId}`));
    if (!snap.exists()) {
      setError("Queue not found.");
      return;
    }

    const alreadySnap = await get(
      ref(db, `users/${user.uid}/joinedQueues/${queueId}`),
    );
    if (alreadySnap.exists()) {
      setError("You already joined this queue.");
      return;
    }

    const queueData = snap.val();
    if (queueData.ownerId === user.uid) {
      setError("You can't join your own queue.");
      return;
    }

    const list = queueData.list ?? {};
    const nextNumber = Object.keys(list).length + 1;

    const entryRef = push(ref(db, `queues/${queueId}/list`));
    await set(entryRef, {
      name: user.displayName,
      uid: user.uid,
      number: nextNumber,
      status: "waiting",
      joinedAt: Date.now(),
    });

    await set(ref(db, `users/${user.uid}/joinedQueues/${queueId}`), nextNumber);
    setJoinLink("");
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={joinLink}
          onChange={(v) => {
            setJoinLink(v);
            setError("");
          }}
          placeholder="Paste join link or queue ID"
          onEnter={joinViaLink}
        />
        <Button onClick={joinViaLink} variant="success">
          Join
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
