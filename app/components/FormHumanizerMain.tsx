"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { HumanizeActionState } from "@/app/actions/humanize";
import { humanizeAction } from "@/app/actions/humanize";

const initialState: HumanizeActionState = { output: "" };

function SubmitButton() {
  const { pending: isPending } = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={isPending}
    >
      {isPending ? "Rewriting…" : "Rewrite"}
    </button>
  );
}

export default function FormHumanizerMain() {
  const [state, formAction] = useActionState(humanizeAction, initialState);

  const [input, setInput] = useState("");
  const [targetTone, setTargetTone] = useState("neutral");
  const [strength, setStrength] = useState<"light" | "medium" | "strong">("medium");
  const [removeEmojis, setRemoveEmojis] = useState(true);
  const [limitEmDashes, setLimitEmDashes] = useState(true);
  const [reduceBuzzwords, setReduceBuzzwords] = useState(true);
  const [varySentenceLength, setVarySentenceLength] = useState(true);
  const [simplifyCliches, setSimplifyCliches] = useState(true);

  const outputRef = useRef<HTMLTextAreaElement | null>(null);

  const charCount = input.length;
  const disabled = charCount === 0;

  useEffect(() => {
    if (state?.output && outputRef.current) {
      outputRef.current.focus();
    }
  }, [state?.output]);

  const example = useMemo(
    () =>
      "I will leverage a comprehensive tapestry of insights — furthermore — to elucidate the intricate landscape 😊.",
    []
  );

  return (
    <div className="w-full max-w-4xl mx-auto grid gap-6">
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="text" className="text-sm font-medium">
            Paste text to humanize
          </label>
          <textarea
            id="text"
            name="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={example}
            rows={8}
            className="w-full resize-y rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          <div className="flex items-center justify-between text-xs text-black/60">
            <span>{charCount} characters</span>
            <button
              type="button"
              onClick={() => setInput("")}
              className="underline underline-offset-2 hover:text-black"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label htmlFor="targetTone" className="text-sm font-medium">
              Target tone
            </label>
            <select
              id="targetTone"
              name="targetTone"
              value={targetTone}
              onChange={e => setTargetTone(e.target.value)}
              className="rounded-md border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
            >
              <option value="neutral">Neutral</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="academic">Academic</option>
            </select>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium">Rewrite strength</span>
            <div className="flex gap-2">
              {(["light", "medium", "strong"] as const).map(level => (
                <label
                  key={level}
                  className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-sm capitalize ${
                    strength === level ? "border-black bg-black text-white" : "border-black/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="strength"
                    value={level}
                    checked={strength === level}
                    onChange={() => setStrength(level)}
                    className="hidden"
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>
        </div>

        <fieldset className="grid gap-1 sm:grid-cols-2 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="removeEmojis"
              checked={removeEmojis}
              onChange={e => setRemoveEmojis(e.target.checked)}
            />
            Remove emojis
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="limitEmDashes"
              checked={limitEmDashes}
              onChange={e => setLimitEmDashes(e.target.checked)}
            />
            Limit em dashes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="reduceBuzzwords"
              checked={reduceBuzzwords}
              onChange={e => setReduceBuzzwords(e.target.checked)}
            />
            Reduce buzzwords
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="varySentenceLength"
              checked={varySentenceLength}
              onChange={e => setVarySentenceLength(e.target.checked)}
            />
            Vary sentence length
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="simplifyCliches"
              checked={simplifyCliches}
              onChange={e => setSimplifyCliches(e.target.checked)}
            />
            Simplify clichés
          </label>
        </fieldset>

        <div className="flex gap-3">
          <SubmitButton />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-black/10 px-4 py-2 text-sm"
            onClick={() => setInput(example)}
          >
            Try example
          </button>
        </div>

        {/* Hidden fields bound to state so they submit with the form */}
        <input type="hidden" name="targetTone" value={targetTone} />
        <input type="hidden" name="strength" value={strength} />
      </form>

      <div className="grid gap-2">
        <label htmlFor="output" className="text-sm font-medium">
          Output
        </label>
        <textarea
          id="output"
          ref={outputRef}
          readOnly
          value={state?.output || ""}
          placeholder="The rewritten text will appear here."
          rows={8}
          className="w-full resize-y rounded-md border border-black/10 px-3 py-2 text-sm bg-gray-50"
        />
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={async () => {
              if (!state?.output) return;
              try {
                await navigator.clipboard.writeText(state.output);
              } catch {}
            }}
            className="inline-flex items-center justify-center rounded-md border border-black/10 px-4 py-2 text-sm"
            disabled={!state?.output}
          >
            Copy
          </button>
          <button
            type="button"
            onClick={() => {
              if (state?.output) setInput(state.output);
            }}
            className="inline-flex items-center justify-center rounded-md border border-black/10 px-4 py-2 text-sm"
            disabled={!state?.output}
          >
            Replace input
          </button>
        </div>
      </div>
    </div>
  );
}
