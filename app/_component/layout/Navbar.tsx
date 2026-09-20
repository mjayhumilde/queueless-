"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useUserPlan } from "@/app/_hooks/useUserPlan";
import { PLANS } from "@/lib/constants";
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { plan, loading: planLoading, error: planError } = useUserPlan(user);

  // early return AFTER all hooks
  if (!user) return null;

  const initials =
    user.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <nav className="bg-brand-complementary px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-50">
      <button
        onClick={() => router.push("/dashboard")}
        className="text-base sm:text-lg font-extrabold text-brand-main tracking-tight flex hover:cursor-pointer"
      >
        <Image src="/queueLessLogo.png" alt="logo" width={60} height={9} />
        Queue<span className="text-brand-tertiary">Less</span>
      </button>
      <div className="flex items-center gap-3">
        {!planLoading && !planError && plan !== PLANS.PRO && (
          <button
            onClick={() => router.push("/pricing")}
            className="text-[11px] font-bold text-brand-tertiary hover:opacity-80 transition-opacity"
          >
            {plan === PLANS.FREE ? "Upgrade" : "Manage plan"}
          </button>
        )}
        <div
          className="w-8 h-8 rounded-full bg-brand-tertiary border-2 border-white/20
          flex items-center justify-center text-[11px] font-extrabold text-brand-complementary"
        >
          {initials}
        </div>
        <span className="text-[12px] text-brand-secondary/70 hidden sm:block truncate max-w-[130px]">
          {user.displayName}
        </span>
        <button
          onClick={logout}
          className="text-[11px] text-brand-secondary/60 hover:text-brand-secondary underline transition-colors hover:cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
