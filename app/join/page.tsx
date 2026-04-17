"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, push, set, onValue } from "firebase/database";
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

  // Load queue info real-time
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

  // Check user already joined queue
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
    if (!user || !queueId) return;
    const snap = await get(ref(db, `queues/${queueId}`));
    if (!snap.exists()) {
      alert("Queue not found!");
      return;
    }

    const data = snap.val();
    const list = data.list ?? {};
    const nextNumber = Object.keys(list).length + 1;

    // Save entry in queue list
    const entryRef = push(ref(db, `queues/${queueId}/list`));
    await set(entryRef, {
      name: user.displayName,
      uid: user.uid,
      number: nextNumber,
      status: "waiting",
      joinedAt: Date.now(),
    });

    await set(ref(db, `users/${user.uid}/joinedQueues/${queueId}`), nextNumber);

    setQueueNumber(nextNumber);
  };

  if (loading) return <p className="p-5">Loading...</p>;

  // Not logged in === inform user
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-5">
        <h1 className="text-2xl font-bold">Join Queue</h1>
        <p className="text-gray-500 text-sm text-center max-w-xs">
          You need to sign in to join a queue so we can track your spot.
        </p>
        <button
          onClick={loginWithGoogle}
          className="bg-blue-500 text-white px-6 py-3 rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!queueId || notFound) {
    return (
      <div className="p-5">
        <p className="text-red-500">
          Invalid or missing queue link. Ask the queue owner for the join link.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-3 underline text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!queueInfo) return <p className="p-5">Loading...</p>;

  const ahead = queueNumber ? queueNumber - queueInfo.current : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <div className="max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-1">{queueInfo.name}</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Now serving: <strong>{queueInfo.current}</strong>
        </p>

        {queueNumber ? (
          <div className="text-center py-10 border rounded p-6">
            <p className="text-gray-500 mb-2 text-sm">Your queue number</p>
            <p className="text-7xl font-bold">{queueNumber}</p>
            <p className="mt-4 text-sm">
              {ahead > 0 ? (
                <span className="text-yellow-600">
                  {ahead} people ahead of you
                </span>
              ) : (
                <span className="text-green-600 font-semibold">
                  You're up next!
                </span>
              )}
            </p>
            {alreadyJoined && (
              <p className="text-xs text-gray-400 mt-2">
                You already joined this queue.
              </p>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 underline text-sm text-gray-500"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="border rounded p-6">
            <p className="text-sm text-gray-500 mb-4">
              Joining as <strong>{user.displayName}</strong>
            </p>
            <button
              onClick={joinQueue}
              className="w-full bg-green-500 text-white py-3 rounded font-semibold"
            >
              Join Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
