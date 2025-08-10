"use server";

export type AnalyzeActionState = {
  analysis: string | null;
  error?: string;
};

const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

export async function analyzeAction(prevState: AnalyzeActionState, formData: FormData): Promise<AnalyzeActionState> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      analysis: null,
      error: "Missing OPENROUTER_API_KEY. Set it in .env.local and restart the server.",
    };
  }

  const text = String(formData.get("text") || "").trim();
  if (!text) {
    return { analysis: null, error: "Please paste some text to analyze." };
  }

  const systemPrompt = `You are an AI text analyst that identifies artificial writing patterns. Analyze the given text and provide a detailed assessment of AI-like characteristics.

Look for and report on:
1. Excessive use of emojis or inappropriate emoji placement
2. Overuse of em dashes (—) as transitions or interruptions
3. Buzzwords and corporate jargon (leverage, robust, tapestry, etc.)
4. Clichéd transitions (furthermore, moreover, in conclusion, etc.)
5. Repetitive sentence structures or word patterns
6. Overly formal or template-like language
7. Lack of natural human variation in tone and rhythm
8. Use of hashtags, retorical questions, asking questions and giving instant answers in the same sentence

Provide a clear, concise analysis (2-3 paragraphs) that:
- Identifies specific patterns found
- Rates the overall "AI-ness" on a scale of 1-10
- Suggests the most important areas for improvement

Be direct and helpful. Don't add disclaimers about being an AI.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Title": "AI Text Analyzer",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 1.0,
        max_tokens: 500,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        analysis: null,
        error: `OpenRouter error (${res.status}): ${errText.slice(0, 300)}`,
      };
    }

    const data: any = await res.json();
    const analysis = data?.choices?.[0]?.message?.content?.trim?.();
    if (!analysis) {
      return {
        analysis: null,
        error: "The model did not return any analysis. Try again.",
      };
    }

    return { analysis };
  } catch (error: unknown) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as any).message)
        : "Unexpected error while contacting the model.";
    return { analysis: null, error: message };
  }
}
