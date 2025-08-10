export type Analysis = {
  emojis: number;
  emDashes: number;
  cliches: number;
  buzzwords: number;
  avgSentenceLength: number;
  repetition: number; // 0..1
  score: number; // 0..100 lower is better
};

export const SAMPLE_TEXT =
  "In conclusion, we will leverage a comprehensive tapestry of insights — furthermore — to elucidate the intricate landscape 😊. Moreover, we will delve deeper to unlock unprecedented synergies.";

const CLICHES = [
  "in conclusion",
  "furthermore",
  "moreover",
  "in addition",
  "at the end of the day",
  "leverage",
  "unlock synergies",
];

const BUZZWORDS = [
  "tapestry",
  "intricate",
  "robust",
  "scalable",
  "unprecedented",
  "synergies",
  "holistic",
  "granular",
  "delve",
];

function countRegex(text: string, regex: RegExp): number {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/);
}

export function analyzeText(text: string): Analysis {
  if (!text?.trim()) {
    return {
      emojis: 0,
      emDashes: 0,
      cliches: 0,
      buzzwords: 0,
      avgSentenceLength: 0,
      repetition: 0,
      score: 0,
    };
  }

  const emojis = countRegex(text, /[\p{Emoji}]/gu);
  const emDashes = countRegex(text, /—/g);
  const lower = text.toLowerCase();
  const cliches = CLICHES.reduce((n, c) => n + countRegex(lower, new RegExp(`\\b${c}\\b`, "g")), 0);
  const buzzwords = BUZZWORDS.reduce((n, c) => n + countRegex(lower, new RegExp(`\\b${c}\\b`, "g")), 0);

  const sentences = splitSentences(text).filter(Boolean);
  const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
  const avgSentenceLength = lengths.length
    ? Math.round((lengths.reduce((a, b) => a + b, 0) / lengths.length) * 10) / 10
    : 0;

  const tokens = lower.split(/\s+/).filter(Boolean);
  const seen = new Map<string, number>();
  let repeats = 0;
  for (const t of tokens) {
    const prev = seen.get(t) || 0;
    if (prev >= 2) repeats++;
    seen.set(t, prev + 1);
  }
  const repetition = tokens.length ? Math.min(1, repeats / tokens.length) : 0;

  const score = Math.round(
    Math.min(100, emojis * 5 + emDashes * 7 + cliches * 6 + buzzwords * 3 + avgSentenceLength * 1 + repetition * 40)
  );

  return { emojis, emDashes, cliches, buzzwords, avgSentenceLength, repetition, score };
}

export function rewriteText(
  input: string,
  opts: {
    reduceEmojis: boolean;
    toneDownEmDashes: boolean;
    simplifyTone: boolean;
    contractions: boolean;
    varySentenceLength: boolean;
    replaceBuzzwords: boolean;
    jitterSyntax: boolean;
  }
): string {
  let text = (input || "").trim();
  if (!text) return "";

  if (opts.reduceEmojis) {
    // Remove emojis except if directly adjacent to a proper noun or number
    text = text.replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu, "");
  }

  if (opts.toneDownEmDashes) {
    // Replace em dashes used as interjections with comma or period heuristically
    text = text.replace(/\s*—\s*/g, ", ").replace(/,,/g, ",");
  }

  if (opts.replaceBuzzwords) {
    const replacements: Record<string, string> = {
      leverage: "use",
      robust: "reliable",
      scalable: "can grow",
      unprecedented: "new",
      synergies: "benefits",
      holistic: "overall",
      granular: "detailed",
      delve: "explore",
      tapestry: "mix",
      intricate: "complex",
    };
    for (const [k, v] of Object.entries(replacements)) {
      const re = new RegExp(`\\b${k}\\b`, "gi");
      text = text.replace(re, v);
    }
    const clicheReplacements: Record<string, string> = {
      "in conclusion": "overall",
      furthermore: "also",
      moreover: "also",
      "at the end of the day": "ultimately",
      "in addition": "also",
      "unlock synergies": "work well together",
    };
    for (const [k, v] of Object.entries(clicheReplacements)) {
      const re = new RegExp(`\\b${k}\\b`, "gi");
      text = text.replace(re, v);
    }
  }

  if (opts.contractions) {
    const pairs: Array<[RegExp, string]> = [
      [/\bdo not\b/gi, "don't"],
      [/\bare not\b/gi, "aren't"],
      [/\bis not\b/gi, "isn't"],
      [/\bcan not\b/gi, "cannot"],
      [/\bwill not\b/gi, "won't"],
      [/\bI am\b/gi, "I'm"],
      [/\bwe are\b/gi, "we're"],
      [/\byou are\b/gi, "you're"],
    ];
    for (const [re, rep] of pairs) text = text.replace(re, rep);
  }

  if (opts.simplifyTone) {
    // Remove overly formal transitions
    text = text.replace(/\b(however|therefore|thus|moreover)\b[,\s]*/gi, m =>
      m.toLowerCase() === "however" ? "but " : ""
    );
  }

  if (opts.varySentenceLength) {
    // Merge overly short sentences and split overly long ones heuristically
    const sentences = splitSentences(text);
    const normalized: string[] = [];
    for (const s of sentences) {
      const words = s.trim().split(/\s+/);
      if (words.length <= 5 && normalized.length) {
        normalized[normalized.length - 1] =
          normalized[normalized.length - 1].replace(/[.!?]?$/, ", ") + s.toLowerCase();
      } else if (words.length >= 28) {
        const mid = Math.floor(words.length / 2);
        normalized.push(words.slice(0, mid).join(" ") + ".");
        normalized.push(words.slice(mid).join(" "));
      } else {
        normalized.push(s);
      }
    }
    text = normalized.join(" ").replace(/\s+/g, " ");
  }

  if (opts.jitterSyntax) {
    // Lightly vary clause starts
    text = text.replace(
      /\b(also|then|so)\b/gi,
      m => ({ also: "plus", then: "after that", so: "as a result" }[m.toLowerCase()] || m)
    );
  }

  // Final cleanup: trim spaces before punctuation and duplicate punctuation
  text = text
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  return text;
}
