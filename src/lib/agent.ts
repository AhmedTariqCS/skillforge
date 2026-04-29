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

Rules:
1. Cite the specific skill, document, and (when available) the date. Format: "[skill: handling-refund-requests]" or "[doc: notion-refund-policy-v3, 2026-04-08]".
2. If a skill explicitly says "do not do X" — follow it. Hard rules are hard.
3. If two facts conflict, prefer the more recent one and flag the conflict.
4. If the question is outside the loaded skills, say so plainly. Don't invent policy.
5. Be concrete and actionable. Reference Salesforce templates, Slack channels, and people by name where the skill provides them.

`;

function formatSkillForContext(skill: AgentSkill): string {
  return `=====================================
SKILL: ${skill.name}
DESCRIPTION: ${skill.description}
LAST UPDATED: ${skill.lastUpdatedAt}

${skill.body}
=====================================`;
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

  // 2. Build the system prompt with skill bodies inlined
  const skillContext = selected.map(formatSkillForContext).join("\n\n");
  const system = WITH_BRAIN_SYSTEM_BASE + "\n\n" + skillContext;

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
  const system = WITH_BRAIN_SYSTEM_BASE + "\n\n" + skillContext;

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
