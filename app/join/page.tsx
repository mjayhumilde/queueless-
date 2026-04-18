"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  ref,
  get,
  push,
  set,
  onValue,
  runTransaction,
} from "firebase/database";
import { useAuth } from "@/context/authContext";

export default function JoinPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const queueId = params.get("queueId") ?? "";
  const [queueInfo, setQueueInfo] = useState<any>(null);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!queueId) return;
    return onValue(ref(db, `queues/${queueId}`), (snap) => {
      if (!snap.exists()) {
        setNotFound(true);
        return;
      }
      setQueueInfo(snap.val());
    });
  }, [queueId]);

  useEffect(() => {
    if (!user || !queueId) return;
    get(ref(db, `users/${user.uid}/joinedQueues/${queueId}`)).then((snap) => {
      if (snap.exists()) {
        setQueueNumber(snap.val());
        setAlreadyJoined(true);
      }
    });
  }, [user, queueId]);

  const joinQueue = async () => {
    if (!user || !queueId || joining) return;
    setJoining(true);
    try {
      const qSnap = await get(ref(db, `queues/${queueId}`));
      if (!qSnap.exists()) {
        alert("Queue not found!");
        return;
      }
      if (qSnap.val().ownerId === user.uid) {
        alert("You can't join your own queue.");
        return;
      }

      const alreadySnap = await get(
        ref(db, `users/${user.uid}/joinedQueues/${queueId}`),
      );
      if (alreadySnap.exists()) {
        setQueueNumber(alreadySnap.val());
        setAlreadyJoined(true);
        return;
      }

      let assignedNumber = 0;
      await runTransaction(ref(db, `queues/${queueId}/list`), (list) => {
        const entries = Object.values(list ?? {}) as any[];
        const maxNumber = entries.reduce(
          (max, item) => Math.max(max, item.number ?? 0),
          0,
        );
        assignedNumber = maxNumber + 1;
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
      setQueueNumber(assignedNumber);
    } finally {
      setJoining(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-main flex items-center justify-center">
        <p className="text-brand-complementary">Loading...</p>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-brand-main flex flex-col items-center justify-center gap-5 p-5">
        <h1 className="text-2xl font-bold text-brand-complementary">
          Join Queue
        </h1>
        <p className="text-brand-complementary/60 text-sm text-center max-w-xs">
          Sign in to join so we can track your spot.
        </p>
        <button
          onClick={loginWithGoogle}
          className="bg-brand-complementary text-brand-main px-8 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Sign in with Google
        </button>
      </div>
    );

  if (!queueId || notFound)
    return (
      <div className="min-h-screen bg-brand-main flex flex-col items-center justify-center gap-3 p-5">
        <p className="text-red-600">Invalid or missing queue link.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-brand-complementary underline text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );

  if (!queueInfo)
    return (
      <div className="min-h-screen bg-brand-main flex items-center justify-center">
        <p className="text-brand-complementary">Loading...</p>
      </div>
    );

  const ahead = queueNumber ? queueNumber - queueInfo.current : 0;

  return (
    <div className="min-h-screen bg-brand-main flex flex-col items-center justify-center p-5">
      <div className="max-w-sm w-full">
        <h1 className="text-2xl font-bold text-brand-complementary mb-1">
          {queueInfo.name}
        </h1>
        <p className="text-brand-complementary/50 mb-8 text-sm">
          Now serving:{" "}
          <strong>{queueInfo.current === 0 ? "—" : queueInfo.current}</strong>
        </p>

        {queueNumber ? (
          <div className="bg-white border border-brand-complementary/20 rounded-xl p-8 text-center shadow-sm">
            <p className="text-brand-complementary/50 mb-2 text-sm uppercase tracking-widest">
              Your number
            </p>
            <p className="text-8xl font-bold text-brand-complementary">
              {queueNumber}
            </p>
            <p className="mt-5 text-sm">
              {ahead > 0 ? (
                <span className="text-brand-tertiary font-medium">
                  {ahead} people ahead of you
                </span>
              ) : (
                <span className="text-green-700 font-semibold">
                  You're up next!
                </span>
              )}
            </p>
            {alreadyJoined && (
              <p className="text-xs text-brand-complementary/30 mt-2">
                Already joined
              </p>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 text-sm text-brand-complementary/50 underline"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white border border-brand-complementary/20 rounded-xl p-6 shadow-sm">
            <p className="text-sm text-brand-complementary/60 mb-5">
              Joining as <strong>{user.displayName}</strong>
            </p>
            <button
              onClick={joinQueue}
              disabled={joining}
              className="w-full bg-brand-complementary text-brand-main py-3 rounded-lg font-semibold
                hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {joining ? "Joining..." : "Join Queue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
