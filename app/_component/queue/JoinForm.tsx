"use client";
import { useState } from "react";
import { User } from "firebase/auth";
import { joinQueue, extractQueueId } from "@/lib/queueService";
import Input from "../ui/input";
import Button from "../ui/Button";

export default function JoinForm({ user }: { user: User }) {
  const [joinLink, setJoinLink] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleJoin = async () => {
    setError("");
    setSuccess("");
    const queueId = extractQueueId(joinLink);
    if (!queueId) {
      setError("Invalid link or queue ID.");
      return;
    }

    const result = await joinQueue(queueId, user.uid, user.displayName ?? "");
    if (!result.success) {
      setError(result.error ?? "Failed to join.");
      return;
    }

    setJoinLink("");
    setSuccess(`Joined! Your number is ${result.number}.`);
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
          onEnter={handleJoin}
        />
        <Button onClick={handleJoin} variant="primary">
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
