"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
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
        className="text-base sm:text-lg font-extrabold text-brand-main tracking-tight"
      >
        Queue<span className="text-brand-tertiary">Less</span>
      </button>
      <div className="flex items-center gap-3">
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
          className="text-[11px] text-brand-secondary/60 hover:text-brand-secondary underline transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
