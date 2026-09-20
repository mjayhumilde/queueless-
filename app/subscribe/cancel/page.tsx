"use client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function CancelPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-brand-main flex items-center justify-center px-6">
      <div className="bg-white border border-brand-complementary/12 rounded-2xl p-10 text-center max-w-sm w-full">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-complementary/40 mb-3">
          Payment cancelled
        </p>
        <p className="text-[13px] text-brand-complementary/50 mb-6">
          No charges were made. You can upgrade anytime.
        </p>
        <button
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="w-full bg-brand-complementary/8 text-brand-complementary font-bold py-3 rounded-xl hover:bg-brand-complementary/15"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
