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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-main">
        <p className="text-brand-complementary">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-main flex flex-col items-center justify-center gap-6 p-5">
      <h1 className="text-5xl font-bold text-brand-complementary tracking-tight">
        Queueless
      </h1>
      <p className="text-brand-complementary/70 text-center max-w-sm leading-relaxed">
        Create and manage queues, or join one with a link. No more waiting in
        the dark.
      </p>
      <button
        onClick={loginWithGoogle}
        className="bg-brand-complementary text-brand-main px-8 py-3 rounded-lg font-semibold
          hover:opacity-90 transition-opacity mt-2"
      >
        Sign in with Google
      </button>
    </div>
  );
}
