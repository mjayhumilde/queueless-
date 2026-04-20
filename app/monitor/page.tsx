import { Suspense } from "react";
import MonitorPage from "./MonitorPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-complementary flex items-center justify-center">
          <p className="text-brand-secondary/40 text-sm">Loading...</p>
        </div>
      }
    >
      <MonitorPage />
    </Suspense>
  );
}
