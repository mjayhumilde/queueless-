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
      const already = await get(
        ref(db, `users/${user.uid}/joinedQueues/${queueId}`),
      );
      if (already.exists()) {
        setQueueNumber(already.val());
        setAlreadyJoined(true);
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
      setQueueNumber(assignedNumber);
    } finally {
      setJoining(false);
    }
  };

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-brand-main flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );

  if (loading)
    return (
      <Shell>
        <p className="text-center text-brand-complementary/40 text-sm">
          Loading...
        </p>
      </Shell>
    );

  if (!user)
    return (
      <Shell>
        <div className="bg-white border border-brand-complementary/12 rounded-2xl p-7 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-complementary/40 mb-2">
            Join Queue
          </p>
          <h2 className="text-xl font-extrabold text-brand-complementary mb-2">
            Sign in to continue
          </h2>
          <p className="text-[12px] text-brand-complementary/50 mb-6 leading-relaxed">
            We need to know who you are to track your spot in line.
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-brand-complementary
            text-brand-main font-bold text-[13px] py-3.5 rounded-xl hover:opacity-90 transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-brand-complementary">
              G
            </div>
            Continue with Google
          </button>
        </div>
      </Shell>
    );

  if (!queueId || notFound)
    return (
      <Shell>
        <div className="bg-white border border-brand-complementary/12 rounded-2xl p-7 text-center">
          <p className="text-red-500 text-sm mb-4">
            This queue link is invalid or no longer exists.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[12px] text-brand-complementary/50 underline hover:text-brand-complementary"
          >
            Go to Dashboard
          </button>
        </div>
      </Shell>
    );

  if (!queueInfo)
    return (
      <Shell>
        <p className="text-center text-brand-complementary/40 text-sm">
          Loading...
        </p>
      </Shell>
    );

  const ahead = queueNumber ? queueNumber - queueInfo.current : 0;

  return (
    <Shell>
      {/* Queue label */}
      <div className="mb-5 px-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-complementary/40 mb-1">
          Queue
        </p>
        <h1 className="text-2xl font-extrabold text-brand-complementary">
          {queueInfo.name}
        </h1>
        <p className="text-[12px] text-brand-complementary/50 mt-1">
          Now serving:{" "}
          <strong className="text-brand-complementary font-extrabold">
            {queueInfo.current === 0 ? "—" : queueInfo.current}
          </strong>
        </p>
      </div>

      {queueNumber ? (
        <div className="bg-white border border-brand-complementary/12 rounded-2xl p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-complementary/40 mb-5">
            Your number
          </p>
          <p className="text-[100px] font-black text-brand-complementary leading-none tracking-tight mb-5">
            {queueNumber}
          </p>
          <div
            className={`inline-block px-4 py-1.5 rounded-full text-[12px] font-bold mb-6 ${
              ahead <= 0
                ? "bg-green-100 text-green-700"
                : "bg-brand-secondary text-brand-complementary"
            }`}
          >
            {ahead <= 0
              ? "You're up next!"
              : `${ahead} ${ahead === 1 ? "person" : "people"} ahead of you`}
          </div>
          {alreadyJoined && (
            <p className="text-[11px] text-brand-complementary/30 mb-4">
              You already joined this queue
            </p>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="block mx-auto text-[12px] text-brand-complementary/40 underline hover:text-brand-complementary transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="bg-white border border-brand-complementary/12 rounded-2xl p-6">
          <p className="text-[12px] text-brand-complementary/50 mb-5">
            Joining as{" "}
            <strong className="text-brand-complementary">
              {user.displayName}
            </strong>
          </p>
          <button
            onClick={joinQueue}
            disabled={joining}
            className="w-full bg-brand-complementary text-brand-main font-bold text-[14px]
              py-3.5 rounded-xl hover:opacity-90 active:scale-[.98] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {joining ? "Joining..." : "Join Queue"}
          </button>
        </div>
      )}
    </Shell>
  );
}
