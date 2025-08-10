"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Analysis, SAMPLE_TEXT, analyzeText, rewriteText } from "@/lib/humanize";

function Metric({ label, value, warn }: { label: string; value: number | string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-xs text-black/60">{label}</span>
      <span className={`text-sm font-medium ${warn ? "text-red-600" : ""}`}>{value}</span>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export default function IndexHumanizer() {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [opts, setOpts] = useState({
    reduceEmojis: true,
    toneDownEmDashes: true,
    simplifyTone: true,
    contractions: true,
    varySentenceLength: true,
    replaceBuzzwords: true,
    jitterSyntax: false,
  });

  const analysis: Analysis = useMemo(() => analyzeText(input), [input]);
  const outAnalysis: Analysis = useMemo(() => analyzeText(output), [output]);

  const onRewrite = () => {
    const t = rewriteText(input, opts);
    setOutput(t);
    toast({ title: "Rewritten", description: "We toned down AI-like patterns." });
  };

  const onCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast({ title: "Copied", description: "Rewritten text copied to clipboard." });
  };

  const heroRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${Math.max(20, Math.min(80, y))}%`);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="pt-10 pb-8">
        <div
          ref={heroRef}
          className="mx-auto max-w-6xl px-4 rounded-2xl p-8 ring-1 ring-black/10 bg-[radial-gradient(800px_circle_at_var(--mx,50%)_var(--my,60%),rgba(0,0,0,0.06),transparent)]"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI Vibe Remover</h1>
          <p className="mt-3 text-black/70 max-w-2xl">
            Paste text, see AI-style signals, and rewrite it to sound like a real person — fewer em dashes, emojis, and
            buzzwords.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="hero" onClick={() => setInput(SAMPLE_TEXT)}>
              Try sample text
            </Button>
            <a href="#rewrite" className="inline-flex items-center text-sm underline underline-offset-4">
              Learn how it works
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste the text you want to humanize.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Paste your text here..."
                className="min-h-[220px]"
              />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Metric label="Emojis" value={analysis.emojis} warn={analysis.emojis > 2} />
                <Metric label="Em dashes" value={analysis.emDashes} warn={analysis.emDashes > 1} />
                <Metric label="Clichés" value={analysis.cliches} warn={analysis.cliches > 0} />
                <Metric label="Buzzwords" value={analysis.buzzwords} warn={analysis.buzzwords > 0} />
                <Metric label="Avg sent. len" value={analysis.avgSentenceLength} />
                <Metric
                  label="Repetition"
                  value={Math.round(analysis.repetition * 100) + "%"}
                  warn={analysis.repetition > 0.25}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>The rewritten, more human-sounding version.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                onChange={e => setOutput(e.target.value)}
                placeholder="Your rewritten text will appear here..."
                className="min-h-[220px]"
              />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Metric label="Emojis" value={outAnalysis.emojis} />
                <Metric label="Em dashes" value={outAnalysis.emDashes} />
                <Metric label="Clichés" value={outAnalysis.cliches} />
                <Metric label="Buzzwords" value={outAnalysis.buzzwords} />
                <Metric label="Avg sent. len" value={outAnalysis.avgSentenceLength} />
                <Metric label="Repetition" value={Math.round(outAnalysis.repetition * 100) + "%"} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="rewrite" className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Rewrite settings</CardTitle>
              <CardDescription>Choose how aggressively to reduce AI-style signals.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <ToggleRow
                  label="Reduce emojis"
                  checked={opts.reduceEmojis}
                  onChange={v => setOpts({ ...opts, reduceEmojis: v })}
                />
                <ToggleRow
                  label="Tone down em dashes"
                  checked={opts.toneDownEmDashes}
                  onChange={v => setOpts({ ...opts, toneDownEmDashes: v })}
                />
                <ToggleRow
                  label="Simplify formal transitions"
                  checked={opts.simplifyTone}
                  onChange={v => setOpts({ ...opts, simplifyTone: v })}
                />
                <ToggleRow
                  label="Use contractions"
                  checked={opts.contractions}
                  onChange={v => setOpts({ ...opts, contractions: v })}
                />
                <ToggleRow
                  label="Replace buzzwords/clichés"
                  checked={opts.replaceBuzzwords}
                  onChange={v => setOpts({ ...opts, replaceBuzzwords: v })}
                />
                <ToggleRow
                  label="Vary sentence length"
                  checked={opts.varySentenceLength}
                  onChange={v => setOpts({ ...opts, varySentenceLength: v })}
                />
                <ToggleRow
                  label="Light syntax jitter"
                  checked={opts.jitterSyntax}
                  onChange={v => setOpts({ ...opts, jitterSyntax: v })}
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="hero" onClick={onRewrite} disabled={!input}>
                  Rewrite
                </Button>
                <Button variant="outline" onClick={onCopy} disabled={!output}>
                  Copy output
                </Button>
                <Badge variant="secondary" className="ml-auto">
                  AI-sign score: {analysis.score}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>Quick ways to sound more human.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-black/70">
                <li>Prefer commas or short sentences over long em dashes.</li>
                <li>Limit emojis and keep them context-appropriate.</li>
                <li>Swap buzzwords for simple, concrete words.</li>
                <li>Vary sentence length and start words; use contractions.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
