"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, push, set, runTransaction } from "firebase/database";
import { User } from "firebase/auth";
import Input from "../ui/input";
import Button from "../ui/Button";

export default function JoinForm({ user }: { user: User }) {
  const [joinLink, setJoinLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const joinViaLink = async () => {
    setError("");
    setSuccess("");
    if (!joinLink.trim()) return;
    let queueId = joinLink.trim();
    try {
      const url = new URL(joinLink.trim());
      queueId = url.searchParams.get("queueId") ?? "";
    } catch {}

    if (!queueId) {
      setError("Invalid link or queue ID.");
      return;
    }
    const snap = await get(ref(db, `queues/${queueId}`));
    if (!snap.exists()) {
      setError("Queue not found.");
      return;
    }
    const already = await get(
      ref(db, `users/${user.uid}/joinedQueues/${queueId}`),
    );
    if (already.exists()) {
      setError("You already joined this queue.");
      return;
    }
    const queueData = snap.val();
    if (queueData.ownerId === user.uid) {
      setError("You can't join your own queue.");
      return;
    }

    let assignedNumber = 0;
    await runTransaction(ref(db, `queues/${queueId}/list`), (list) => {
      const max = Object.values(list ?? {}).reduce(
        (m: number, i: any) => Math.max(m, i.number ?? 0),
        0,
      );
      assignedNumber = (max as number) + 1;
      return list;
    });

    const entryRef = push(ref(db, `queues/${queueId}/list`));
    await set(entryRef, {
      name: user.displayName,
      uid: user.uid,
      number: assignedNumber,
      status: "waiting",
      joinedAt: Date.now(),
    });
    await set(
      ref(db, `users/${user.uid}/joinedQueues/${queueId}`),
      assignedNumber,
    );
    setJoinLink("");
    setSuccess(`Joined! Your number is ${assignedNumber}.`);
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={joinLink}
          onChange={(v) => {
            setJoinLink(v);
            setError("");
            setSuccess("");
          }}
          placeholder="Paste join link or queue ID"
          onEnter={joinViaLink}
        />
        <Button onClick={joinViaLink} variant="primary">
          Join
        </Button>
      </div>
      {error && (
        <p className="text-red-600 text-[11px] mt-1.5 font-medium">{error}</p>
      )}
      {success && (
        <p className="text-green-700 text-[11px] mt-1.5 font-medium">
          {success}
        </p>
      )}
    </div>
  );
}
