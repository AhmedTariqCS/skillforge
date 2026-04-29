import Anthropic from "@anthropic-ai/sdk";
import { getClaude, MODELS } from "./claude";

export interface ForgeFact {
  type:
    | "policy"
    | "procedure"
    | "decision"
    | "constraint"
    | "person"
    | "system";
  topic: string;
  statement: string;
  confidence: number;
}

export interface ForgeSkill {
  name: string;
  description: string;
  body: string;
}

const EXTRACT_SYSTEM = `You are Skillforge's fact extraction engine. You read raw company knowledge — Slack threads, Notion docs, post-mortems, policy documents, support tickets — and extract structured, executable facts that an AI agent could use to make correct decisions.

You output ONLY valid JSON, no prose, no markdown fences. The JSON must be parseable.

Rules:
1. Each fact is self-contained and quotable. An agent reading just this fact must understand what to do.
2. "constraint" type is for hard rules: "do not X", "never Y", "always Z". These are the most valuable facts because they encode learned-the-hard-way wisdom.
3. "decision" type is for resolved precedents: "we approved X for Y reason".
4. "policy" type is for stated rules in current force.
5. "procedure" type is for sequential steps to follow.
6. "person" type is for who-owns-what knowledge.
7. Skip facts that are generic to all companies. Focus on what's specific to THIS text.
8. Confidence reflects how clearly the source supports the fact (0.0–1.0).
9. Topic is a short slug ("refunds", "incident-response", "hiring", etc.).
10. Output between 3 and 10 facts. Quality over quantity.`;

const EXTRACT_USER_TEMPLATE = (text: string, hint?: string) => `${hint ? `Context hint: ${hint}\n\n` : ""}TEXT:
"""
${text}
"""

Extract structured facts. Output JSON in EXACTLY this shape, with no prose before or after:

{
  "topic": "<overall topic slug>",
  "facts": [
    {
      "type": "policy" | "procedure" | "decision" | "constraint" | "person" | "system",
      "topic": "<topic slug>",
      "statement": "<1-2 sentences>",
      "confidence": <number 0-1>
    }
  ]
}`;

export async function extractFacts(
  text: string,
  hint?: string
): Promise<{ topic: string; facts: ForgeFact[] }> {
  const client = getClaude();
  const res = await client.messages.create({
    model: MODELS.classify, // Haiku for speed
    max_tokens: 1500,
    system: EXTRACT_SYSTEM,
    messages: [{ role: "user", content: EXTRACT_USER_TEMPLATE(text, hint) }],
  });
  const raw = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const parsed = parseExtractionJson(raw);
  return parsed;
}

function parseExtractionJson(raw: string): {
  topic: string;
  facts: ForgeFact[];
} {
  // Be lenient — strip markdown fences and surrounding prose
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  // Find the first { and last }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("Could not find JSON in extraction response");
  }
  cleaned = cleaned.slice(first, last + 1);
  let parsed: { topic?: string; facts?: ForgeFact[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      "Extraction returned invalid JSON: " +
        (err instanceof Error ? err.message : String(err))
    );
  }
  return {
    topic: parsed.topic ?? "general",
    facts: parsed.facts ?? [],
  };
}

const SKILL_SYSTEM = `You are Skillforge's skill compiler. You take structured facts and produce a SKILL.md file in Claude's Agent Skills format.

You follow Anthropic's published Agent Skills best practices:

1. **YAML frontmatter** with required fields:
   - name: lowercase-hyphens, max 64 chars, gerund form when natural ("handling-X", "approving-Y", "responding-to-Z")
   - description: max 1024 chars, written in THIRD PERSON, includes both what the skill does AND when to use it
   - No "anthropic" or "claude" in the name. No XML tags anywhere.

2. **Body** under 500 lines:
   - Concise — assume the agent is intelligent.
   - Use tables for matrices.
   - Hard rules called out with "Do NOT" / "Never" language.
   - Examples that are concrete and tied to the source facts.
   - No time-sensitive phrases ("currently", "as of today") — use "current" or version markers instead.
   - Use forward slashes in paths.
   - Consistent terminology.

3. **Tone:** confident, instructional, third person to the agent.

You output ONLY the SKILL.md content. Start with --- (the YAML frontmatter delimiter). No commentary. No markdown code fences around the whole output.`;

const SKILL_USER_TEMPLATE = (
  topic: string,
  facts: ForgeFact[],
  source: string
) => `Topic: ${topic}

Facts (extracted from a real source document):
${JSON.stringify(facts, null, 2)}

Original source (for reference quotes only — do not paste verbatim):
"""
${source.slice(0, 4000)}${source.length > 4000 ? "\n...(truncated)" : ""}
"""

Synthesize a SKILL.md for this topic. The skill should let an AI agent execute the implied workflow correctly without re-reading the source.`;

export interface SkillStreamEvent {
  delta?: string;
  done?: ForgeSkill;
}

export async function* streamSkillSynthesis(
  topic: string,
  facts: ForgeFact[],
  source: string
): AsyncGenerator<SkillStreamEvent, void, unknown> {
  const client = getClaude();
  let fullText = "";

  const stream = client.messages.stream({
    model: MODELS.extract, // Opus for quality on the synthesis
    max_tokens: 2500,
    system: SKILL_SYSTEM,
    messages: [
      { role: "user", content: SKILL_USER_TEMPLATE(topic, facts, source) },
    ],
  });

  for await (const ev of stream) {
    if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
      fullText += ev.delta.text;
      yield { delta: ev.delta.text };
    }
  }

  // Parse the SKILL.md
  const skill = parseSkillMarkdown(fullText);
  yield { done: skill };
}

function parseSkillMarkdown(md: string): ForgeSkill {
  const fmMatch = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    return {
      name: "untitled-skill",
      description: "Skill synthesis did not produce valid frontmatter.",
      body: md.trim(),
    };
  }
  const frontmatter = fmMatch[1];
  const body = fmMatch[2].trim();
  const nameMatch = frontmatter.match(/name:\s*(.+?)\s*$/m);
  const descMatch = frontmatter.match(
    /description:\s*((?:.|\n  )+?)(?:\n[a-z]+:|\n*$)/
  );
  const name = (nameMatch?.[1] ?? "untitled-skill").trim().replace(/^["']|["']$/g, "");
  const description = (descMatch?.[1] ?? "Auto-generated skill.")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\n  /g, " ");
  return { name, description, body };
}

// Convenience: full extraction → synthesis pipeline (non-streaming)
export async function forge(
  text: string,
  hint?: string
): Promise<{ facts: ForgeFact[]; skill: ForgeSkill }> {
  const { topic, facts } = await extractFacts(text, hint);
  let skill: ForgeSkill = { name: "", description: "", body: "" };
  for await (const ev of streamSkillSynthesis(topic, facts, text)) {
    if (ev.done) skill = ev.done;
  }
  return { facts, skill };
}
