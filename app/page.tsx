"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export default function HomePage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading]);

  if (loading) return <p className="p-5">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-5">
      <h1 className="text-4xl font-bold">Queueless</h1>
      <p className="text-gray-500 text-center max-w-sm">
        Create and manage queues, or join one with a link. No more waiting in
        the dark.
      </p>
      <button
        onClick={loginWithGoogle}
        className="bg-blue-500 text-white px-6 py-3 rounded mt-4"
      >
        Sign in with Google to get started
      </button>
    </div>
  );
}
