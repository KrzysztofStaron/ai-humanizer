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

  // Common AI overused phrases that should be avoided or replaced
  const aiOverusedPhrases = [
    "provide a valuable insight",
    "left an indelible mark",
    "play a significant role in shaping",
    "an unwavering commitment",
    "open a new avenue",
    "a stark reminder",
    "play a crucial role in determining",
    "finding a contribution",
    "crucial role in understanding",
    "finding a shed light",
    "tapestry",
    "embark",
    "vibrant landscape",
    "delve into",
    "dive deep",
    "comprehensive",
    "seamless",
    "game-changer",
    "cutting-edge",
    "innovative solution",
  ];

  const constraints: string[] = [
    `Adopt a ${targetTone} tone and tailor the voice to sound natural and engaging.`,
    removeEmojis
      ? "Remove all emojis unless they are essential for meaning."
      : "Keep only meaningful emojis; do not add new ones.",
    limitEmDashes
      ? "Limit the use of em dashes; prefer commas, periods, or parentheses for clarity."
      : "Use em dashes only when they genuinely improve readability.",
    reduceBuzzwords
      ? `Eliminate buzzwords, boilerplate, and overused AI phrases. Specifically avoid: ${aiOverusedPhrases
          .slice(0, 10)
          .join(", ")}. Use specific, concrete language instead.`
      : "Avoid jargon unless it is necessary for the topic or audience.",
    varySentenceLength
      ? "Vary sentence length and structure significantly to avoid repetitive or formulaic patterns. Mix short punchy sentences with longer, complex ones to create natural rhythm."
      : "Maintain a natural flow and avoid robotic or monotonous cadence.",
    simplifyCliches
      ? "Replace clichés and canned transitions with direct, original phrasing. Avoid generic metaphors and overused comparisons."
      : "Avoid overly formal or template-like transitions.",
    "Fact-check all claims and avoid making unsupported or generic statements. Replace vague expert-sounding claims with specific, verifiable information.",
    "Be specific and use rich, descriptive words instead of vague or generic language. Avoid empty statements that sound authoritative but lack substance.",
    "Favor active voice over passive voice and use first-person perspective when appropriate to increase engagement and authenticity.",
    "Incorporate storytelling elements, personal anecdotes, or concrete examples to make the content more relatable and emotionally engaging.",
    "Replace formulaic third-person descriptions with conversational, engaging language that speaks directly to the reader.",
    "Add authentic emotion and genuine insight rather than just listing facts or information.",
    "Use casual, conversational language that connects with the audience rather than overly formal or academic tone.",
    "Preserve the original meaning, facts, and intent. Do not invent or alter factual details.",
    "Keep formatting and markdown if present. Leave code blocks unchanged unless explicitly instructed.",
    "Do not use hashtags, rhetorical questions, or answer questions immediately after asking them in the same sentence.",
  ];

  const strengthRule =
    strength === "light"
      ? "Make minimal edits; fix only AI giveaways and flow."
      : strength === "medium"
      ? "Rewrite for human voice while preserving author style where possible."
      : "Substantial rewrite for natural, human voice; keep all facts intact.";

  return `Rewrite the user's text to read like natural human writing that demonstrates expertise, experience, authoritativeness, and trustworthiness (E-E-A-T). Transform formulaic AI content into engaging, authentic human communication.

Key Strategies for Humanization:
1. Sentence Structure: Vary sentence length dramatically - mix short, punchy statements with longer, flowing sentences to create natural rhythm
2. Voice & Perspective: Use active voice and first-person when appropriate; avoid monotonous third-person descriptions
3. Storytelling: Incorporate narrative elements, concrete examples, and personal insights to create emotional connection
4. Authenticity: Replace generic expert-sounding phrases with specific, nuanced analysis that shows deep understanding
5. Engagement: Write conversationally, as if speaking directly to the reader, not delivering a formal presentation

Guidelines:
- ${constraints.join("\n- ")}
- ${strengthRule}
- Replace AI "hallmark phrases" with original, human expressions that convey the same meaning more naturally
- Ensure the rewritten content demonstrates genuine expertise rather than surface-level knowledge
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
