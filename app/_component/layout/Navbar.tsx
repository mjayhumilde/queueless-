"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <nav className="bg-brand-complementary px-6 py-3 flex justify-between items-center">
      <button
        onClick={() => router.push("/dashboard")}
        className="font-bold text-lg text-brand-main tracking-wide"
      >
        Queueless
      </button>
      <div className="flex items-center gap-4">
        <span className="text-sm text-brand-secondary">{user.displayName}</span>
        <button
          onClick={logout}
          className="text-sm text-brand-secondary underline hover:text-brand-main"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
