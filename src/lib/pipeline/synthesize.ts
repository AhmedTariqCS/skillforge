import Anthropic from "@anthropic-ai/sdk";
import { getClaude, MODELS } from "../claude";
import type {
  Conflict,
  ResolvedFact,
  SynthesizedSkill,
} from "./types";

// Stage 5: skill synthesis. Takes resolved facts (already ranked, deduped,
// with conflict info) and produces a SKILL.md that:
//   - Surfaces the highest-rank facts first
//   - Calls out hard rules in a "Hard rules" section
//   - Includes a "Conflicts to review" section if any
//   - Cites every fact by ID for downstream traceability

const SYNTH_SYSTEM = `You are Skillforge's skill compiler. You take resolved facts (already deduplicated, ranked, and conflict-checked) and produce a SKILL.md file in Claude's Agent Skills format.

Follow Anthropic's published Agent Skills best practices STRICTLY:

1. YAML frontmatter:
   - name: lowercase-hyphens, max 64 chars, gerund form ("handling-X", "approving-Y", "responding-to-Z")
   - description: max 1024 chars, THIRD PERSON, includes WHAT the skill does AND WHEN to use it
   - No "anthropic" or "claude" in the name. No XML tags anywhere.

2. Body:
   - Under 500 lines.
   - "## When to use this skill" near the top.
   - "## Hard rules" section if there are constraint-type facts. State each as a single sentence with NEVER / DO NOT.
   - Workflow steps as numbered lists or checklist syntax.
   - Tables for matrices.
   - Concrete examples tied to the facts (not generic).
   - "## Conflicts to review" section if the input has unresolved conflicts.
   - No time-sensitive language ("currently", "as of today", "next week"). Use "current" or version markers.
   - Use forward slashes in paths.
   - Consistent terminology.

3. Tone: confident, instructional, third person.

You output ONLY the SKILL.md content. Start with --- (the YAML delimiter). No commentary. No code fences around the whole output.`;

export interface SynthesisOptions {
  apiKey?: string;
  model?: string;
  onDelta?: (text: string) => void;
}

export async function synthesize(
  topic: string,
  facts: ResolvedFact[],
  conflicts: Conflict[],
  sourceText: string,
  opts: SynthesisOptions = {}
): Promise<{
  skill: SynthesizedSkill;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = opts.apiKey
    ? new Anthropic({ apiKey: opts.apiKey })
    : getClaude();

  const factSummary = facts
    .slice()
    .sort((a, b) => b.finalRank - a.finalRank)
    .map((f) => ({
      id: f.id,
      type: f.type,
      topic: f.topic,
      statement: f.statement,
      authority: Math.round(f.authorityScore * 100) / 100,
      rank: Math.round(f.finalRank * 100) / 100,
      evidence: f.evidence.map((e) => e.quote.slice(0, 200)),
      effectiveDate: f.effectiveDate,
      supersedes: f.supersedes,
      unresolvedConflicts: f.unresolvedConflicts,
    }));

  const conflictSummary = conflicts.map((c) => ({
    a: c.factIdA,
    b: c.factIdB,
    kind: c.kind,
    rationale: c.rationale,
  }));

  const userMessage = `Topic: ${topic}

Resolved facts (already deduplicated, ranked by authority + recency):
${JSON.stringify(factSummary, null, 2)}

${
  conflictSummary.length > 0
    ? `Detected conflicts (surface these in the "## Conflicts to review" section):
${JSON.stringify(conflictSummary, null, 2)}\n`
    : ""
}

Original source (reference quotes only, do not paste verbatim):
"""
${sourceText.slice(0, 4000)}${sourceText.length > 4000 ? "\n...(truncated)" : ""}
"""

Synthesize SKILL.md. Begin with the --- frontmatter. No prose before or after.`;

  const stream = client.messages.stream({
    model: opts.model ?? MODELS.extract,
    max_tokens: 3000,
    system: SYNTH_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
  });

  let raw = "";
  let inputTokens = 0;
  let outputTokens = 0;

  for await (const ev of stream) {
    if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
      raw += ev.delta.text;
      opts.onDelta?.(ev.delta.text);
    } else if (ev.type === "message_start") {
      inputTokens = ev.message.usage.input_tokens;
    } else if (ev.type === "message_delta" && ev.usage) {
      outputTokens = ev.usage.output_tokens;
    }
  }

  const skill = parseSkillMarkdown(raw, facts.map((f) => f.id));
  return { skill, inputTokens, outputTokens };
}

function parseSkillMarkdown(md: string, factIds: string[]): SynthesizedSkill {
  const fmMatch = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    return {
      name: "untitled-skill",
      description: "Skill synthesis did not produce valid frontmatter.",
      body: md.trim(),
      raw: md.trim(),
      factIds,
    };
  }
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
    factIds,
  };
}
