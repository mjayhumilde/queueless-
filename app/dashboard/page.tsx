"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
} from "firebase/database";
import { useAuth } from "@/context/authContext";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [queueName, setQueueName] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [joinError, setJoinError] = useState("");
  const [myQueues, setMyQueues] = useState<Record<string, any>>({});
  const [joinedQueues, setJoinedQueues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    return onValue(ref(db, "queues"), (snap) => {
      if (!snap.exists()) {
        setMyQueues({});
        return;
      }
      const all = snap.val();
      const mine = Object.fromEntries(
        Object.entries(all).filter(([, q]: any) => q.ownerId === user.uid),
      );
      setMyQueues(mine);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onValue(ref(db, `users/${user.uid}/joinedQueues`), async (snap) => {
      if (!snap.exists()) {
        setJoinedQueues({});
        return;
      }
      const joinedIds: Record<string, number> = snap.val();
      const results: Record<string, any> = {};
      await Promise.all(
        Object.entries(joinedIds).map(async ([queueId, myNumber]) => {
          const qSnap = await get(ref(db, `queues/${queueId}`));
          if (qSnap.exists()) {
            results[queueId] = { ...qSnap.val(), myNumber };
          }
        }),
      );
      setJoinedQueues(results);
    });
  }, [user]);

  const createQueue = async () => {
    if (!user || !queueName.trim()) return;
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

  const joinViaLink = async () => {
    setJoinError("");
    if (!user || !joinLink.trim()) return;

    // Accept full URL || queueId
    let queueId = joinLink.trim();
    try {
      const url = new URL(joinLink.trim());
      queueId = url.searchParams.get("queueId") ?? "";
    } catch {
      // Not URL
    }

    if (!queueId) {
      setJoinError("Invalid link or queue ID.");
      return;
    }

    // Check if queue exists
    const snap = await get(ref(db, `queues/${queueId}`));
    if (!snap.exists()) {
      setJoinError("Queue not found.");
      return;
    }

    // Check if already joined
    const alreadySnap = await get(
      ref(db, `users/${user.uid}/joinedQueues/${queueId}`),
    );
    if (alreadySnap.exists()) {
      setJoinError("You already joined this queue.");
      return;
    }

    // Check if user is the owner
    const queueData = snap.val();
    if (queueData.ownerId === user.uid) {
      setJoinError("You can't join your own queue.");
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

  const callNext = async (queueId: string) => {
    const queueRef = ref(db, `queues/${queueId}`);
    const snap = await get(queueRef);
    if (!snap.exists()) return;
    await update(queueRef, { current: snap.val().current + 1 });
  };

  const deleteQueue = async (queueId: string) => {
    if (!confirm("Delete this queue?")) return;
    await remove(ref(db, `queues/${queueId}`));
  };

  const copyJoinLink = (queueId: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join?queueId=${queueId}`,
    );
    alert("Join link copied!");
  };

  if (loading || !user) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-5 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.displayName}</span>
          <button onClick={logout} className="text-sm underline text-gray-400">
            Sign out
          </button>
        </div>
      </div>

      {/* Join a Queue */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Join a Queue</h2>
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Paste join link or queue ID"
            value={joinLink}
            onChange={(e) => {
              setJoinLink(e.target.value);
              setJoinError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && joinViaLink()}
          />
          <button
            onClick={joinViaLink}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Join
          </button>
        </div>
        {joinError && <p className="text-red-500 text-sm mt-1">{joinError}</p>}
      </section>

      {/* Create a Queue */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Create a Queue</h2>
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1 rounded"
            placeholder="Queue name"
            value={queueName}
            onChange={(e) => setQueueName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createQueue()}
          />
          <button
            onClick={createQueue}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </section>

      {/* My Queues */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">My Queues</h2>
        {Object.keys(myQueues).length === 0 ? (
          <p className="text-gray-400 text-sm">No queues created yet.</p>
        ) : (
          Object.entries(myQueues).map(([queueId, queue]: any) => {
            const waitingCount = Object.values(queue.list ?? {}).filter(
              (item: any) => item.number > queue.current,
            ).length;
            return (
              <div key={queueId} className="border rounded p-4 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{queue.name}</p>
                    <p className="text-sm text-gray-500">
                      Serving: <strong>{queue.current}</strong> · Waiting:{" "}
                      <strong>{waitingCount}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => deleteQueue(queueId)}
                    className="text-red-400 text-sm underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => callNext(queueId)}
                    className="bg-green-500 text-white px-3 py-1 text-sm rounded"
                  >
                    Call Next
                  </button>
                  <button
                    onClick={() => copyJoinLink(queueId)}
                    className="bg-gray-600 text-white px-3 py-1 text-sm rounded"
                  >
                    Copy Join Link
                  </button>
                  <button
                    onClick={() =>
                      window.open(`/monitor?queueId=${queueId}`, "_blank")
                    }
                    className="bg-purple-500 text-white px-3 py-1 text-sm rounded"
                  >
                    Monitor
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Queues Joined */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Queues I Joined</h2>
        {Object.keys(joinedQueues).length === 0 ? (
          <p className="text-gray-400 text-sm">
            You haven't joined any queues yet.
          </p>
        ) : (
          Object.entries(joinedQueues).map(([queueId, queue]: any) => {
            const ahead = queue.myNumber - queue.current;
            return (
              <div key={queueId} className="border rounded p-4 mb-3">
                <p className="font-bold">{queue.name}</p>
                <p className="text-sm text-gray-500">
                  Your number: <strong>{queue.myNumber}</strong> · Now serving:{" "}
                  <strong>{queue.current}</strong>
                </p>
                <p className="text-sm mt-1">
                  {ahead > 0 ? (
                    <span className="text-yellow-600">
                      {ahead} people ahead of you
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      You're up!
                    </span>
                  )}
                </p>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
