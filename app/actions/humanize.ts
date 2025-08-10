"use server";

export type HumanizeActionState = {
  output: string;
  error?: string;
};

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

function buildPrompt(options: {
  targetTone: string;
  removeEmojis: boolean;
  limitEmDashes: boolean;
  reduceBuzzwords: boolean;
  varySentenceLength: boolean;
  simplifyCliches: boolean;
  strength: "light" | "medium" | "strong";
}) {
  const { targetTone, removeEmojis, limitEmDashes, reduceBuzzwords, varySentenceLength, simplifyCliches, strength } =
    options;

  const constraints: string[] = [
    `Tone: ${targetTone}`,
    removeEmojis
      ? "Remove emojis unless clearly purposeful."
      : "Keep emojis if they contribute meaning; do not add new ones.",
    limitEmDashes
      ? "Limit em dashes; prefer commas, periods, or parentheses sparingly."
      : "Use em dashes only when they genuinely improve readability.",
    reduceBuzzwords
      ? "Avoid buzzwords and boilerplate; use precise, concrete language."
      : "Avoid jargon unless domain-specific and necessary.",
    varySentenceLength
      ? "Vary sentence length and rhythm; avoid repetitive structures."
      : "Maintain natural flow; avoid robotic cadence.",
    simplifyCliches
      ? "Replace clichés and canned transitions with direct phrasing."
      : "Avoid overly formal, template-like transitions.",
    "Preserve original meaning, facts, and intent. Do not invent details.",
    "Keep formatting and markdown if present. Keep code blocks unchanged unless asked.",
    "Don't use hashtags, retorical questions, asking questions and giving instant answers in the same sentence",
    "Don't use emojis",
    "Don't use em dashes",
    "Don't use buzzwords and boilerplate",
    "Don't use clichés and canned transitions",
    "Don't use overly formal, template-like transitions",
    "Don't use robotic cadence",
    "Don't use hashtags, retorical questions, asking questions and giving instant answers in the same sentence",
  ];

  const strengthRule =
    strength === "light"
      ? "Make minimal edits; fix only AI giveaways and flow."
      : strength === "medium"
      ? "Rewrite for human voice while preserving author style where possible."
      : "Substantial rewrite for natural, human voice; keep all facts intact.";

  return `Rewrite the user's text to read like natural human writing.

Guidelines:
- ${constraints.join("\n- ")}
- ${strengthRule}
- Do not add disclaimers. Output only the rewritten text, nothing else.`;
}

export async function humanizeAction(prevState: HumanizeActionState, formData: FormData): Promise<HumanizeActionState> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      output: "",
      error: "Missing OPENROUTER_API_KEY. Set it in .env.local and restart the server.",
    };
  }

  const text = String(formData.get("text") || "").trim();
  if (!text) {
    return { output: "", error: "Please paste some text to humanize." };
  }

  const removeEmojis = formData.get("removeEmojis") === "on";
  const limitEmDashes = formData.get("limitEmDashes") === "on";
  const reduceBuzzwords = formData.get("reduceBuzzwords") === "on";
  const varySentenceLength = formData.get("varySentenceLength") === "on";
  const simplifyCliches = formData.get("simplifyCliches") === "on";
  const targetTone = String(formData.get("targetTone") || "neutral");
  const strength = String(formData.get("strength") || "medium") as "light" | "medium" | "strong";

  try {
    const system = buildPrompt({
      targetTone,
      removeEmojis,
      limitEmDashes,
      reduceBuzzwords,
      varySentenceLength,
      simplifyCliches,
      strength,
    });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Title": "Sing Removal",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 2000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        output: "",
        error: `OpenRouter error (${res.status}): ${errText.slice(0, 300)}`,
      };
    }

    const data: any = await res.json();
    const output = data?.choices?.[0]?.message?.content?.trim?.();
    if (!output) {
      return {
        output: "",
        error: "The model did not return any text. Try again or adjust options.",
      };
    }

    return { output };
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as any).message)
        : "Unexpected error while contacting the model.";
    return { output: "", error: message };
  }
}
