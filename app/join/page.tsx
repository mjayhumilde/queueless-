import { Suspense } from "react";
import JoinPage from "./JoinPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-main flex items-center justify-center">
          <p className="text-brand-complementary/40 text-sm">Loading...</p>
        </div>
      }
    >
      <JoinPage />
    </Suspense>
  );
}
