import { Suspense } from "react";
import dynamic from "next/dynamic";

const FormHumanizerMain = dynamic(() => import("@/app/components/FormHumanizerMain"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto max-w-5xl px-6 py-10 grid gap-8">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sing Removal — Make AI text sound human</h1>
          <p className="text-sm text-black/70">
            Rewrite content to reduce AI giveaways: emojis, overused em dashes, buzzwords, clichéd transitions, and
            robotic cadence.
          </p>
        </div>
        <Suspense fallback={<div className="text-sm text-black/60">Loading…</div>}>
          <FormHumanizerMain />
        </Suspense>
        <p className="text-xs text-black/50">
          Tip: Set your `OPENAI_API_KEY` in `.env.local`. You can override the model via `OPENAI_MODEL`.
        </p>
      </main>
    </div>
  );
}
