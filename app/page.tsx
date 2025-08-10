"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { humanizeAction, type HumanizeActionState } from "@/app/actions/humanize";
import { analyzeAction, type AnalyzeActionState } from "@/app/actions/analyze";

const initialHumanizeState: HumanizeActionState = { output: "" };
const initialAnalyzeState: AnalyzeActionState = { analysis: null };

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="default"
      disabled={pending || disabled}
      className="bg-zinc-900 hover:bg-zinc-800 text-white"
    >
      {pending ? "Processing..." : children}
    </Button>
  );
}

function AnalyzeButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending || disabled}
      className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
    >
      {pending ? "Analyzing..." : children}
    </Button>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [targetTone, setTargetTone] = useState("neutral");
  const [strength, setStrength] = useState<"light" | "medium" | "strong">("medium");
  const [removeEmojis, setRemoveEmojis] = useState(true);
  const [limitEmDashes, setLimitEmDashes] = useState(true);
  const [reduceBuzzwords, setReduceBuzzwords] = useState(true);
  const [varySentenceLength, setVarySentenceLength] = useState(true);
  const [simplifyCliches, setSimplifyCliches] = useState(true);

  const [humanizeState, humanizeFormAction] = useActionState(humanizeAction, initialHumanizeState);
  const [analyzeState, analyzeFormAction] = useActionState(analyzeAction, initialAnalyzeState);

  const handleCopy = async () => {
    if (!humanizeState?.output) return;
    try {
      await navigator.clipboard.writeText(humanizeState.output);
      toast({ title: "Copied!", description: "Text copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Please copy manually" });
    }
  };

  const example =
    "In conclusion, we will leverage a comprehensive tapestry of insights — furthermore — to elucidate the intricate landscape 😊. Moreover, we will delve deeper to unlock unprecedented synergies.";

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">AI Text Humanizer</h1>
          <p className="text-lg text-zinc-700 max-w-2xl mx-auto">
            Transform AI-generated content into natural, human-like text. Remove telltale signs like excessive emojis,
            em dashes, and buzzwords while preserving meaning.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Input Section */}
          <Card className="border-zinc-200 bg-white">
            <CardHeader className="border-zinc-100">
              <CardTitle className="text-zinc-900">Input Text</CardTitle>
              <CardDescription className="text-zinc-600">
                Paste the text you want to analyze and humanize
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Paste your AI-generated text here..."
                  className="min-h-[200px] border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 text-zinc-900 placeholder:text-zinc-400"
                />
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInput(example)}
                    className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                  >
                    Try Example
                  </Button>
                  <form action={analyzeFormAction}>
                    <input type="hidden" name="text" value={input} />
                    <AnalyzeButton disabled={!input.trim()}>Analyze with AI</AnalyzeButton>
                  </form>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInput("")}
                    className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analyzeState?.analysis && (
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="border-zinc-100">
                <CardTitle className="text-zinc-900">AI Analysis Results</CardTitle>
                <CardDescription className="text-zinc-600">
                  AI-powered detection of artificial writing patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="prose prose-sm text-zinc-700 max-w-none whitespace-pre-wrap">
                    {analyzeState.analysis}
                  </div>
                  {analyzeState.error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                      {analyzeState.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings and Rewrite */}
          <Card className="border-zinc-200 bg-white">
            <CardHeader className="border-zinc-100">
              <CardTitle className="text-zinc-900">Humanization Settings</CardTitle>
              <CardDescription className="text-zinc-600">Configure how the AI will rewrite your text</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={humanizeFormAction} className="space-y-6">
                <input type="hidden" name="text" value={input} />

                {/* Tone and Strength */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="targetTone" className="text-sm font-medium text-zinc-900">
                      Target Tone
                    </label>
                    <select
                      id="targetTone"
                      name="targetTone"
                      value={targetTone}
                      onChange={e => setTargetTone(e.target.value)}
                      className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-zinc-500"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                      <option value="professional">Professional</option>
                      <option value="academic">Academic</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900">Rewrite Strength</label>
                    <div className="flex gap-2">
                      {(["light", "medium", "strong"] as const).map(level => (
                        <label
                          key={level}
                          className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm capitalize transition-colors ${
                            strength === level
                              ? "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="strength"
                            value={level}
                            checked={strength === level}
                            onChange={() => setStrength(level)}
                            className="sr-only"
                          />
                          {level}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-zinc-900">Humanization Options</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {
                        key: "removeEmojis",
                        label: "Remove excessive emojis",
                        checked: removeEmojis,
                        onChange: setRemoveEmojis,
                      },
                      {
                        key: "limitEmDashes",
                        label: "Limit em dashes",
                        checked: limitEmDashes,
                        onChange: setLimitEmDashes,
                      },
                      {
                        key: "reduceBuzzwords",
                        label: "Replace buzzwords",
                        checked: reduceBuzzwords,
                        onChange: setReduceBuzzwords,
                      },
                      {
                        key: "varySentenceLength",
                        label: "Vary sentence length",
                        checked: varySentenceLength,
                        onChange: setVarySentenceLength,
                      },
                      {
                        key: "simplifyCliches",
                        label: "Simplify clichés",
                        checked: simplifyCliches,
                        onChange: setSimplifyCliches,
                      },
                    ].map(({ key, label, checked, onChange }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2"
                      >
                        <span className="text-sm text-zinc-700">{label}</span>
                        <Switch
                          checked={checked}
                          onCheckedChange={onChange}
                          className="data-[state=checked]:bg-zinc-900"
                        />
                        <input type="hidden" name={key} value={checked ? "on" : "off"} />
                      </label>
                    ))}
                  </div>
                </div>

                <SubmitButton disabled={!input.trim()}>Rewrite with AI</SubmitButton>
              </form>
            </CardContent>
          </Card>

          {/* Output Section */}
          {(humanizeState?.output || humanizeState?.error) && (
            <Card className="border-zinc-200 bg-white">
              <CardHeader className="border-zinc-100">
                <CardTitle className="text-zinc-900">Humanized Output</CardTitle>
                <CardDescription className="text-zinc-600">
                  AI-rewritten text with reduced artificial patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {humanizeState.output && (
                    <>
                      <Textarea
                        value={humanizeState.output}
                        readOnly
                        className="min-h-[200px] border-zinc-300 bg-zinc-50 text-zinc-900"
                      />
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCopy}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        >
                          Copy Output
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setInput(humanizeState.output)}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        >
                          Use as Input
                        </Button>
                      </div>
                    </>
                  )}
                  {humanizeState.error && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                      {humanizeState.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setup Instructions */}
          <Card className="border-zinc-200 bg-zinc-50">
            <CardContent className="pt-6">
              <div className="text-sm text-zinc-600">
                <strong className="text-zinc-900">Setup:</strong> Add your{" "}
                <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800">OPENROUTER_API_KEY</code> to{" "}
                <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800">.env.local</code> to enable AI features.
                Optionally set <code className="bg-zinc-200 px-1 py-0.5 rounded text-zinc-800">OPENROUTER_MODEL</code>{" "}
                (defaults to openai/gpt-4o-mini).
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
