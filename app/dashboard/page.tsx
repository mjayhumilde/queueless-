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

function SectionIcon({
  children,
  bg,
}: {
  children: React.ReactNode;
  bg: string;
}) {
  return (
    <div
      className={`w-5 h-5 rounded-md flex items-center justify-center ${bg}`}
    >
      {children}
    </div>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-complementary/50">
          {label}
        </span>
      </div>
      {children}
    </section>
  );
}

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
      <div className="min-h-screen bg-brand-main flex items-center justify-center">
        <p className="text-brand-complementary/40 text-sm">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-main">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Section
          label="Join a queue"
          icon={
            <SectionIcon bg="bg-green-50">
              <svg width="35" height="35" viewBox="0 0 12 12" fill="none">
                <circle
                  cx="6"
                  cy="6"
                  r="4.5"
                  stroke="#16a34a"
                  strokeWidth="1.2"
                />
                <path
                  d="M6 3.5v2.5l1.5 1"
                  stroke="#16a34a"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </SectionIcon>
          }
        >
          <JoinForm user={user} />
        </Section>

        <Section
          label="Create a queue"
          icon={
            <SectionIcon bg="bg-brand-tertiary/10">
              <svg width="35" height="35" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2.5v7M2.5 6h7"
                  stroke="#FF9644"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </SectionIcon>
          }
        >
          <CreateForm user={user} />
        </Section>

        <Section
          label="My queues"
          icon={
            <SectionIcon bg="bg-brand-complementary/6">
              <svg width="35" height="35" viewBox="0 0 12 12" fill="none">
                <rect
                  x="2"
                  y="2"
                  width="8"
                  height="8"
                  rx="1.5"
                  stroke="#562F00"
                  strokeWidth="1.1"
                  opacity=".4"
                />
                <path
                  d="M4 5h4M4 7h2.5"
                  stroke="#562F00"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity=".4"
                />
              </svg>
            </SectionIcon>
          }
        >
          {Object.keys(myQueues).length === 0 ? (
            <p className="text-[13px] text-brand-complementary/35 py-2">
              No queues created yet.
            </p>
          ) : (
            Object.entries(myQueues).map(([queueId, queue]) => (
              <QueueCard key={queueId} queueId={queueId} queue={queue} />
            ))
          )}
        </Section>

        <Section
          label="Queues I joined"
          icon={
            <SectionIcon bg="bg-brand-secondary/30">
              <svg width="35" height="35" viewBox="0 0 12 12" fill="none">
                <circle
                  cx="6"
                  cy="4"
                  r="2"
                  stroke="#FF9644"
                  strokeWidth="1.2"
                />
                <path
                  d="M2 10.5c0-2.21 1.79-4 4-4s4 1.79 4 4"
                  stroke="#FF9644"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </SectionIcon>
          }
        >
          {Object.keys(joinedQueues).length === 0 ? (
            <p className="text-[13px] text-brand-complementary/35 py-2">
              You haven't joined any queues yet.
            </p>
          ) : (
            Object.entries(joinedQueues).map(([queueId, queue]) => (
              <JoinedCard key={queueId} queueId={queueId} queue={queue} />
            ))
          )}
        </Section>
      </div>
    </div>
  );
}
