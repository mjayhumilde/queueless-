"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

import Image from "next/image";

export default function HomePage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading]);

  if (loading)
    return (
      <div className="min-h-screen bg-brand-main flex items-center justify-center">
        <p className="text-brand-complementary/40 text-sm">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-main flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-5">
        {/* Badge */}
        <div className="flex items-center gap-1.5 bg-brand-complementary/6 border border-brand-complementary/12 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-tertiary" />
          <span className="text-[10px] font-bold tracking-widest text-brand-complementary/50 uppercase">
            ALPHA PHASE TESTING
          </span>
        </div>

        {/* Logo */}
        <Image
          src="/queuelessLogo.png"
          alt="QueueLess"
          width={190}
          height={50}
        />

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-black text-brand-complementary tracking-tight leading-none">
          Queue<span className="text-brand-tertiary">Less</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] text-brand-complementary/55 leading-relaxed max-w-65">
          Skip the confusion. Create a queue, share a link, and let everyone
          know their spot — in real time.
        </p>

        {/* Auth card */}
        <div className="w-full bg-white border border-brand-complementary/12 rounded-2xl p-6 mt-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-complementary/40 mb-4">
            Get started
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-brand-complementary
              text-brand-main font-bold text-[14px] py-3.5 rounded-xl hover:cursor-pointer
              hover:opacity-90 active:scale-[.98] transition-all"
          >
            <div
              className="w-5 h-5 rounded-full bg-white flex items-center justify-center
              text-[10px] font-black text-brand-complementary"
            >
              G
            </div>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-brand-complementary/10" />
            <span className="text-[10px] text-brand-complementary/30">
              free to use
            </span>
            <div className="flex-1 h-px bg-brand-complementary/10" />
          </div>
          <p className="text-[11px] text-brand-complementary/30 text-center">
            *for testing, no subscriptions for now*
          </p>
        </div>
      </div>
    </div>
  );
}
