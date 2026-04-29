import Anthropic from "@anthropic-ai/sdk";
import {
  EXTRACT_SYSTEM,
  SKILL_SYSTEM,
  extractUserPrompt,
  skillUserPrompt,
} from "./prompts.js";

export type FactType =
  | "policy"
  | "procedure"
  | "decision"
  | "constraint"
  | "person"
  | "system";

export interface Fact {
  type: FactType;
  topic: string;
  statement: string;
  confidence: number;
}

export interface ExtractionResult {
  topic: string;
  facts: Fact[];
}

export interface Skill {
  name: string;
  description: string;
  body: string;
  raw: string;
}

export interface ForgeResult {
  topic: string;
  facts: Fact[];
  skill: Skill;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ForgeOptions {
  apiKey?: string;
  hint?: string;
  extractModel?: string;
  synthesisModel?: string;
  onProgress?: (event: ProgressEvent) => void;
}

export type ProgressEvent =
  | { type: "stage"; stage: "extracting" | "synthesizing" | "done" }
  | { type: "fact"; fact: Fact; index: number }
  | { type: "skill_delta"; text: string };

const DEFAULT_EXTRACT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_SYNTHESIS_MODEL = "claude-opus-4-7";

function getClient(apiKey?: string): Anthropic {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Pass it via the --api-key flag, the ANTHROPIC_API_KEY environment variable, or the apiKey option."
    );
  }
  return new Anthropic({ apiKey: key });
}

export async function extractFacts(
  text: string,
  opts: ForgeOptions = {}
): Promise<ExtractionResult & { inputTokens: number; outputTokens: number }> {
  const client = getClient(opts.apiKey);
  const res = await client.messages.create({
    model: opts.extractModel ?? DEFAULT_EXTRACT_MODEL,
    max_tokens: 1500,
    system: EXTRACT_SYSTEM,
    messages: [{ role: "user", content: extractUserPrompt(text, opts.hint) }],
  });
  const raw = res.content
    .filter(
      (b): b is Anthropic.TextBlock => (b as { type?: string }).type === "text"
    )
    .map((b) => b.text)
    .join("");
  const parsed = parseExtractionJson(raw);
  return {
    ...parsed,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
  };
}

function parseExtractionJson(raw: string): ExtractionResult {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) {
    throw new Error("Extraction response did not contain JSON.");
  }
  cleaned = cleaned.slice(first, last + 1);
  let parsed: Partial<ExtractionResult>;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Extraction returned malformed JSON: ${(err as Error).message}`
    );
  }
  return {
    topic: parsed.topic ?? "general",
    facts: parsed.facts ?? [],
  };
}

export async function synthesizeSkill(
  topic: string,
  facts: Fact[],
  source: string,
  opts: ForgeOptions = {}
): Promise<Skill & { inputTokens: number; outputTokens: number }> {
  const client = getClient(opts.apiKey);
  const stream = client.messages.stream({
    model: opts.synthesisModel ?? DEFAULT_SYNTHESIS_MODEL,
    max_tokens: 2500,
    system: SKILL_SYSTEM,
    messages: [
      { role: "user", content: skillUserPrompt(topic, facts, source) },
    ],
  });

  let raw = "";
  let inputTokens = 0;
  let outputTokens = 0;

  for await (const ev of stream) {
    if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
      raw += ev.delta.text;
      opts.onProgress?.({ type: "skill_delta", text: ev.delta.text });
    } else if (ev.type === "message_start") {
      inputTokens = ev.message.usage.input_tokens;
    } else if (ev.type === "message_delta" && ev.usage) {
      outputTokens = ev.usage.output_tokens;
    }
  }

  const parsed = parseSkillMarkdown(raw);
  return { ...parsed, inputTokens, outputTokens };
}

function parseSkillMarkdown(md: string): Skill {
  const fmMatch = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  const fallback: Skill = {
    name: "untitled-skill",
    description: "Skill synthesis did not produce valid frontmatter.",
    body: md.trim(),
    raw: md.trim(),
  };
  if (!fmMatch) return fallback;
  const frontmatter = fmMatch[1];
  const body = fmMatch[2].trim();
  const nameMatch = frontmatter.match(/^name:\s*(.+?)\s*$/m);
  const descMatch = frontmatter.match(
    /description:\s*((?:.|\n  )+?)(?:\n[a-z_]+:|\n*$)/
  );
  const name = (nameMatch?.[1] ?? "untitled-skill")
    .trim()
    .replace(/^["']|["']$/g, "");
  const description = (descMatch?.[1] ?? "Auto-generated skill.")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\n  /g, " ");
  return {
    name,
    description,
    body,
    raw: md.trim(),
  };
}

export async function forge(
  text: string,
  opts: ForgeOptions = {}
): Promise<ForgeResult> {
  if (text.trim().length < 80) {
    throw new Error("Input is too short — paste at least a paragraph.");
  }
  if (text.length > 100_000) {
    throw new Error("Input is too long — keep under 100,000 characters.");
  }

  opts.onProgress?.({ type: "stage", stage: "extracting" });
  const extraction = await extractFacts(text, opts);
  for (let i = 0; i < extraction.facts.length; i++) {
    opts.onProgress?.({ type: "fact", fact: extraction.facts[i], index: i });
  }

  opts.onProgress?.({ type: "stage", stage: "synthesizing" });
  const skill = await synthesizeSkill(
    extraction.topic,
    extraction.facts,
    text,
    opts
  );

  opts.onProgress?.({ type: "stage", stage: "done" });

  return {
    topic: extraction.topic,
    facts: extraction.facts,
    skill: {
      name: skill.name,
      description: skill.description,
      body: skill.body,
      raw: skill.raw,
    },
    usage: {
      inputTokens: extraction.inputTokens + skill.inputTokens,
      outputTokens: extraction.outputTokens + skill.outputTokens,
    },
  };
}

export function formatSkillMarkdown(skill: Skill): string {
  return `---
name: ${skill.name}
description: ${skill.description}
---

${skill.body}
`;
}

export const VERSION = "0.1.0";
