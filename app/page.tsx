import { Suspense } from "react";
import dynamic from "next/dynamic";
const Index = dynamic(() => import("@/app/routes/IndexHumanizer"), { ssr: false });

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-black/60">Loading…</div>}>
      <Index />
    </Suspense>
  );
}
