"use client";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <nav className="border-b px-5 py-3 flex justify-between items-center">
      <button
        onClick={() => router.push("/dashboard")}
        className="font-bold text-lg"
      >
        Queueless
      </button>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user.displayName}</span>
        <button onClick={logout} className="text-sm underline text-gray-400">
          Sign out
        </button>
      </div>
    </nav>
  );
}
