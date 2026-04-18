"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { useMyQueues } from "../_hooks/useMyQueues";
import { useJoinedQueues } from "../_hooks/useJoinedQueues";
import CreateForm from "../_component/queue/CreateForm";
import JoinForm from "../_component/queue/JoinForm";
import QueueCard from "../_component/queue/QueueCard";
import JoinedCard from "../_component/queue/JoinedCard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const myQueues = useMyQueues(user);
  const joinedQueues = useJoinedQueues(user);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading]);

  if (loading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-main">
        <p className="text-brand-complementary">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-main">
      <div className="max-w-xl mx-auto px-5 py-8">
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-tertiary mb-3">
            Join a Queue
          </h2>
          <JoinForm user={user} />
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-tertiary mb-3">
            Create a Queue
          </h2>
          <CreateForm user={user} />
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-tertiary mb-3">
            My Queues
          </h2>
          {Object.keys(myQueues).length === 0 ? (
            <p className="text-brand-complementary/50 text-sm">
              No queues created yet.
            </p>
          ) : (
            Object.entries(myQueues).map(([queueId, queue]) => (
              <QueueCard key={queueId} queueId={queueId} queue={queue} />
            ))
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-tertiary mb-3">
            Queues I Joined
          </h2>
          {Object.keys(joinedQueues).length === 0 ? (
            <p className="text-brand-complementary/50 text-sm">
              You haven't joined any queues yet.
            </p>
          ) : (
            Object.entries(joinedQueues).map(([queueId, queue]) => (
              <JoinedCard key={queueId} queueId={queueId} queue={queue} />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
