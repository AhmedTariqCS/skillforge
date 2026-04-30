import Anthropic from "@anthropic-ai/sdk";
import { getClaude, MODELS } from "./claude";
import { NORTHWIND_SKILLS, getRelevantSkillsForPrompt } from "./seed/skills";
import { NORTHWIND_DOCS } from "./seed/northwind";
import type { AgentSkill, SourceDoc } from "./types";

export interface AgentResponse {
  text: string;
  skillsUsed: string[];
  citedDocIds: string[];
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

const WITHOUT_BRAIN_SYSTEM = `You are a helpful AI assistant deployed at a SaaS company called Northwind. Northwind is a B2B customer support platform. You help employees (CSMs, AEs, engineers, ops) with their work. Answer the user's question as best you can with no other context.`;

const WITH_BRAIN_SYSTEM_BASE = `You are an AI assistant deployed at Northwind, a B2B customer support SaaS company. Northwind has a "Company Brain" — a structured set of executable skills generated from the company's Slack, Notion, GitHub, and Intercom history.

The skills below were selected for this query because their descriptions matched. Each skill is a self-contained playbook with policies, decisions, examples, and guardrails. Use them as the source of truth.

CITATION RULES (these are mandatory, not optional):

1. **Inline-cite the skill** the first time you reference it: \`[skill: <skill-name>]\`.
2. **Inline-cite the source document** every time you reference a specific policy, decision, post-mortem, or named precedent: \`[doc: <doc-id>]\`. Use the EXACT IDs from the "AVAILABLE SOURCE DOCS" list below — never invent or paraphrase IDs.
3. **Citations are inline, not footnotes.** Place the bracket directly after the claim it supports.
4. **Cite at least 2 source docs in any non-trivial response.** If you reference a hard rule, name the post-mortem doc that codified it. If you reference a precedent, cite the ticket or thread.

WORKED EXAMPLE (this is the format we want):

> Per Refund Policy v3 [doc: notion-refund-policy-v3], Enterprise customers more than 90 days in receive pro-rated credit, max 6 months. The most recent comparable case is TICK-4488 [doc: intercom-ticket-4488] — Lumen Labs received \$48k in service credit. Following [skill: handling-refund-requests], you should clear approval with VP CS before responding.

OPERATIONAL RULES:

5. If a skill explicitly says "do not do X" — follow it. Hard rules are hard.
6. If two facts conflict, prefer the more recent one and flag the conflict.
7. If the question is outside the loaded skills, say so plainly. Don't invent policy.
8. Be concrete and actionable. Reference Salesforce templates, Slack channels, and people by name where the skill provides them.

`;

function formatSkillForContext(skill: AgentSkill): string {
  return `=====================================
SKILL: ${skill.name}
DESCRIPTION: ${skill.description}
LAST UPDATED: ${skill.lastUpdatedAt}

${skill.body}
=====================================`;
}

// Build a compact catalog of source doc IDs the agent is allowed to cite.
// We pull only the docs backing the loaded skills so the agent doesn't
// reach for IDs unrelated to the current query.
function formatSourceCatalog(selected: AgentSkill[]): string {
  const factIds = new Set(selected.flatMap((s) => s.factIds));
  // Lazy import to avoid a circular dep at module init.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { NORTHWIND_FACTS } = require("./seed/facts") as typeof import("./seed/facts");
  const docIds = new Set<string>();
  for (const fact of NORTHWIND_FACTS) {
    if (factIds.has(fact.id)) {
      for (const ev of fact.evidence) docIds.add(ev.docId);
    }
  }
  const docs = NORTHWIND_DOCS.filter((d) => docIds.has(d.id));
  if (docs.length === 0) {
    return "AVAILABLE SOURCE DOCS:\n  (no docs were directly indexed for the loaded skills — answer using the skill body alone, no [doc: ...] citations)";
  }
  const lines = docs.map(
    (d) =>
      `  - ${d.id} — ${d.title} (${d.source}; ${d.author}${d.authorRole ? `, ${d.authorRole}` : ""})`
  );
  return `AVAILABLE SOURCE DOCS (use these EXACT IDs in [doc: ...] citations):\n${lines.join("\n")}`;
}

export async function runWithoutBrain(prompt: string): Promise<AgentResponse> {
  const t0 = Date.now();
  const client = getClaude();
  const res = await client.messages.create({
    model: MODELS.agent,
    max_tokens: 1024,
    system: WITHOUT_BRAIN_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return {
    text,
    skillsUsed: [],
    citedDocIds: [],
    latencyMs: Date.now() - t0,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
  };
}

export interface WithBrainOptions {
  forceSkills?: string[]; // bypass selection — used by the demo to guarantee relevant skills load
}

export async function runWithBrain(
  prompt: string,
  opts: WithBrainOptions = {}
): Promise<AgentResponse> {
  const t0 = Date.now();
  const client = getClaude();

  // 1. Pick which skills to load. In production this would be Claude's
  //    native skill discovery; here we either honor forceSkills or use
  //    a keyword heuristic and fall back to the top 2 skills.
  let selected: AgentSkill[];
  if (opts.forceSkills && opts.forceSkills.length > 0) {
    selected = NORTHWIND_SKILLS.filter((s) =>
      opts.forceSkills!.includes(s.name)
    );
  } else {
    const matched = getRelevantSkillsForPrompt(prompt);
    selected = matched.slice(0, 3);
    if (selected.length === 0) {
      // Triage with Claude itself — pick the most relevant skill from descriptions
      selected = await pickSkillsViaTriage(prompt);
    }
  }

  // 2. Build the system prompt with skill bodies + source catalog inlined
  const skillContext = selected.map(formatSkillForContext).join("\n\n");
  const sourceCatalog = formatSourceCatalog(selected);
  const system =
    WITH_BRAIN_SYSTEM_BASE + "\n" + sourceCatalog + "\n\n" + skillContext;

  // 3. Run the agent
  const res = await client.messages.create({
    model: MODELS.agent,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  // 4. Best-effort extraction of cited doc IDs from the response
  const citedDocIds = extractCitedDocs(text);

  return {
    text,
    skillsUsed: selected.map((s) => s.name),
    citedDocIds,
    latencyMs: Date.now() - t0,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
  };
}

async function pickSkillsViaTriage(prompt: string): Promise<AgentSkill[]> {
  const client = getClaude();
  const skillCatalog = NORTHWIND_SKILLS.map(
    (s) => `- ${s.name}: ${s.description}`
  ).join("\n");
  const triagePrompt = `You are routing a query to the most relevant skills in a company brain. Below is the catalog. Return ONLY a JSON array of skill names (max 3), most relevant first. No prose.

Catalog:
${skillCatalog}

Query: ${prompt}

JSON array only:`;
  const res = await client.messages.create({
    model: MODELS.classify,
    max_tokens: 200,
    messages: [{ role: "user", content: triagePrompt }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return NORTHWIND_SKILLS.slice(0, 1);
    const names: string[] = JSON.parse(match[0]);
    return NORTHWIND_SKILLS.filter((s) => names.includes(s.name));
  } catch {
    return NORTHWIND_SKILLS.slice(0, 1);
  }
}

function extractCitedDocs(text: string): string[] {
  // The agent is asked to cite using "[doc: <id>, ...]" format
  const re = /\[doc:\s*([a-z0-9-]+)/gi;
  const ids = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    ids.add(m[1]);
  }
  return [...ids];
}

export function getDocsByIds(ids: string[]): SourceDoc[] {
  return NORTHWIND_DOCS.filter((d) => ids.includes(d.id));
}

// Streaming variants for the live demo UI

export async function* streamWithBrain(
  prompt: string,
  opts: WithBrainOptions = {}
): AsyncGenerator<{ delta?: string; done?: AgentResponse }, void, unknown> {
  const t0 = Date.now();
  const client = getClaude();

  let selected: AgentSkill[];
  if (opts.forceSkills && opts.forceSkills.length > 0) {
    selected = NORTHWIND_SKILLS.filter((s) =>
      opts.forceSkills!.includes(s.name)
    );
  } else {
    const matched = getRelevantSkillsForPrompt(prompt);
    selected = matched.slice(0, 3);
    if (selected.length === 0) {
      selected = await pickSkillsViaTriage(prompt);
    }
  }

  const skillContext = selected.map(formatSkillForContext).join("\n\n");
  const sourceCatalog = formatSourceCatalog(selected);
  const system =
    WITH_BRAIN_SYSTEM_BASE + "\n" + sourceCatalog + "\n\n" + skillContext;

  let fullText = "";
  let inputTokens = 0;
  let outputTokens = 0;

  const stream = client.messages.stream({
    model: MODELS.agent,
    max_tokens: 1500,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const ev of stream) {
    if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
      fullText += ev.delta.text;
      yield { delta: ev.delta.text };
    } else if (ev.type === "message_delta" && ev.usage) {
      outputTokens = ev.usage.output_tokens;
    } else if (ev.type === "message_start") {
      inputTokens = ev.message.usage.input_tokens;
    }
  }

  yield {
    done: {
      text: fullText,
      skillsUsed: selected.map((s) => s.name),
      citedDocIds: extractCitedDocs(fullText),
      latencyMs: Date.now() - t0,
      inputTokens,
      outputTokens,
    },
  };
}

export async function* streamWithoutBrain(
  prompt: string
): AsyncGenerator<{ delta?: string; done?: AgentResponse }, void, unknown> {
  const t0 = Date.now();
  const client = getClaude();

  let fullText = "";
  let inputTokens = 0;
  let outputTokens = 0;

  const stream = client.messages.stream({
    model: MODELS.agent,
    max_tokens: 1024,
    system: WITHOUT_BRAIN_SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const ev of stream) {
    if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
      fullText += ev.delta.text;
      yield { delta: ev.delta.text };
    } else if (ev.type === "message_delta" && ev.usage) {
      outputTokens = ev.usage.output_tokens;
    } else if (ev.type === "message_start") {
      inputTokens = ev.message.usage.input_tokens;
    }
  }

  yield {
    done: {
      text: fullText,
      skillsUsed: [],
      citedDocIds: [],
      latencyMs: Date.now() - t0,
      inputTokens,
      outputTokens,
    },
  };
}
