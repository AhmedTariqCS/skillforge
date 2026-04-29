#!/usr/bin/env tsx
import { readFile, writeFile, readdir, stat, mkdir } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { runPipeline } from "../src/lib/pipeline";

// Skillforge eval runner.
// Walks evals/cases/*, runs the pipeline against each input.md, scores the
// generated SKILL.md against reference.md using a Claude Opus grader,
// writes results.json.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... tsx evals/run.ts
//   ANTHROPIC_API_KEY=sk-ant-... tsx evals/run.ts --case 01-deploy-freeze

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EVALS_ROOT = __dirname;
const CASES_DIR = join(EVALS_ROOT, "cases");

const GRADER_MODEL = "claude-opus-4-7";

const GRADER_SYSTEM = `You are an expert grader for AI-generated SKILL.md files (Anthropic Agent Skills format).

You score the GENERATED skill on four axes (1-5 each), independent of the reference. The reference is provided as a benchmark for what's possible from this input — but the generated skill should be graded on its own merits.

Output ONLY a valid JSON object in this exact shape:
{
  "faithfulness": <1-5>,
  "executability": <1-5>,
  "format": <1-5>,
  "conciseness": <1-5>,
  "notes": {
    "faithfulness": "<one sentence citing the generated skill>",
    "executability": "<one sentence>",
    "format": "<one sentence>",
    "conciseness": "<one sentence>"
  }
}

Rubric:

FAITHFULNESS (1-5)
- 5: Every claim is grounded in the source. Hard rules carried through verbatim.
- 4: All material claims grounded. May add reasonable inference.
- 3: Mostly faithful, with one minor invented detail.
- 2: Multiple invented facts, or a critical hard-rule miss.
- 1: Substantively contradicts the source.

EXECUTABILITY (1-5)
- 5: Agent can act on the skill alone. Decisions are precise.
- 4: Agent can act in most cases. One vague step.
- 3: Framework only — agent would need to look up specifics.
- 2: Topic learned, no confident decision possible.
- 1: Generic guidance only.

FORMAT (1-5)
- 5: Fully compliant with Anthropic's Agent Skills format. Frontmatter parses. Name is gerund (lowercase-hyphens, ≤64 chars). Description third-person, ≤1024 chars, includes what + when. No XML tags. No time-sensitive language ("currently", "next week"). Body ≤500 lines. Forward slashes.
- 4: One minor deviation.
- 3: Two minor or one moderate deviation.
- 2: Multiple violations.
- 1: Frontmatter malformed.

CONCISENESS (1-5)
- 5: Every section earns its place.
- 4: Tight, with one or two trim candidates.
- 3: Has filler.
- 2: Substantial filler.
- 1: Bloated.

Be honest. We use these numbers to improve the pipeline.`;

interface CaseMeta {
  type: string;
  title: string;
  author: string;
  authorRole: string;
  updatedAt: string;
  domain: string;
  difficulty: "easy" | "medium" | "hard";
}

interface AxisScores {
  faithfulness: number;
  executability: number;
  format: number;
  conciseness: number;
}

interface CaseResult extends AxisScores {
  caseId: string;
  domain: string;
  difficulty: string;
  inputType: string;
  inputChars: number;
  skillName: string;
  total: number;
  grade: "A" | "B" | "C" | "D";
  notes: Record<keyof AxisScores, string>;
  costUsd: number;
  durationMs: number;
}

interface RunResults {
  runAt: string;
  models: { extract: string; synthesize: string; grade: string };
  cases: CaseResult[];
  aggregate: {
    n: number;
    meanTotal: number;
    meanByAxis: AxisScores;
    grades: Record<"A" | "B" | "C" | "D", number>;
    totalCostUsd: number;
  };
}

function gradeFromTotal(total: number): "A" | "B" | "C" | "D" {
  if (total >= 17) return "A";
  if (total >= 13) return "B";
  if (total >= 9) return "C";
  return "D";
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("✖ ANTHROPIC_API_KEY is not set.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const onlyArg = args.indexOf("--case");
  const onlyCase = onlyArg >= 0 ? args[onlyArg + 1] : null;

  const entries = await readdir(CASES_DIR);
  const caseDirs: string[] = [];
  for (const entry of entries.sort()) {
    const full = join(CASES_DIR, entry);
    const st = await stat(full);
    if (!st.isDirectory()) continue;
    if (onlyCase && entry !== onlyCase) continue;
    caseDirs.push(entry);
  }

  console.log(`✦ Running ${caseDirs.length} case${caseDirs.length === 1 ? "" : "s"}…\n`);

  const grader = new Anthropic({ apiKey });
  const results: CaseResult[] = [];

  for (const caseId of caseDirs) {
    const caseDir = join(CASES_DIR, caseId);
    const input = await readFile(join(caseDir, "input.md"), "utf8");
    const reference = await readFile(join(caseDir, "reference.md"), "utf8");
    const meta = JSON.parse(
      await readFile(join(caseDir, "meta.json"), "utf8")
    ) as CaseMeta;

    process.stderr.write(`→ ${caseId} (${meta.domain}, ${meta.difficulty}, ${meta.type})\n`);

    const t0 = Date.now();
    let pipelineResult;
    try {
      pipelineResult = await runPipeline(
        {
          text: input,
          source: {
            type: meta.type as
              | "slack"
              | "notion"
              | "drive"
              | "github"
              | "intercom"
              | "linear"
              | "email",
            title: meta.title,
            author: meta.author,
            authorRole: meta.authorRole,
            updatedAt: meta.updatedAt,
          },
        },
        { apiKey }
      );
    } catch (err) {
      console.error(
        `  ✖ pipeline failed: ${err instanceof Error ? err.message : err}`
      );
      continue;
    }
    const generated = pipelineResult.skill.raw;

    // Save the generated SKILL.md for transparency
    await writeFile(join(caseDir, "generated.md"), generated, "utf8");

    process.stderr.write(
      `  ✓ generated ${pipelineResult.skill.name} in ${Date.now() - t0}ms · ${pipelineResult.candidateFacts.length} candidates → ${pipelineResult.resolvedFacts.length} resolved · cost ~$${pipelineResult.trace.totalCostUsd.toFixed(3)}\n`
    );

    // Grade
    const graderRes = await grader.messages.create({
      model: GRADER_MODEL,
      max_tokens: 800,
      system: GRADER_SYSTEM,
      messages: [
        {
          role: "user",
          content: `INPUT (raw source the pipeline saw):
"""
${input.slice(0, 6000)}
"""

REFERENCE SKILL.md (hand-written benchmark — what an ideal compiler would produce):
"""
${reference}
"""

GENERATED SKILL.md (the pipeline's actual output — grade THIS):
"""
${generated}
"""

Output JSON only.`,
        },
      ],
    });

    const text = graderRes.content
      .filter(
        (b): b is Anthropic.TextBlock =>
          (b as { type?: string }).type === "text"
      )
      .map((b) => b.text)
      .join("");
    const json = extractJson(text);
    if (!json) {
      console.error(`  ✖ grader returned non-JSON for ${caseId}`);
      continue;
    }

    const total =
      json.faithfulness + json.executability + json.format + json.conciseness;
    const grade = gradeFromTotal(total);
    const grader_cost =
      (graderRes.usage.input_tokens * 15) / 1_000_000 +
      (graderRes.usage.output_tokens * 75) / 1_000_000;

    const result: CaseResult = {
      caseId,
      domain: meta.domain,
      difficulty: meta.difficulty,
      inputType: meta.type,
      inputChars: input.length,
      skillName: pipelineResult.skill.name,
      faithfulness: json.faithfulness,
      executability: json.executability,
      format: json.format,
      conciseness: json.conciseness,
      total,
      grade,
      notes: json.notes,
      costUsd: pipelineResult.trace.totalCostUsd + grader_cost,
      durationMs: Date.now() - t0,
    };
    results.push(result);

    process.stderr.write(
      `  ✓ graded: faith ${json.faithfulness} · exec ${json.executability} · fmt ${json.format} · concise ${json.conciseness} = ${total}/20 (${grade})\n\n`
    );
  }

  const totalCost = results.reduce((s, r) => s + r.costUsd, 0);
  const meanTotal = results.reduce((s, r) => s + r.total, 0) / Math.max(1, results.length);
  const meanByAxis: AxisScores = {
    faithfulness:
      results.reduce((s, r) => s + r.faithfulness, 0) / Math.max(1, results.length),
    executability:
      results.reduce((s, r) => s + r.executability, 0) / Math.max(1, results.length),
    format:
      results.reduce((s, r) => s + r.format, 0) / Math.max(1, results.length),
    conciseness:
      results.reduce((s, r) => s + r.conciseness, 0) / Math.max(1, results.length),
  };
  const grades: Record<"A" | "B" | "C" | "D", number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const r of results) grades[r.grade]++;

  const out: RunResults = {
    runAt: new Date().toISOString(),
    models: {
      extract: "claude-haiku-4-5-20251001",
      synthesize: "claude-opus-4-7",
      grade: GRADER_MODEL,
    },
    cases: results,
    aggregate: {
      n: results.length,
      meanTotal: Math.round(meanTotal * 10) / 10,
      meanByAxis: {
        faithfulness: Math.round(meanByAxis.faithfulness * 100) / 100,
        executability: Math.round(meanByAxis.executability * 100) / 100,
        format: Math.round(meanByAxis.format * 100) / 100,
        conciseness: Math.round(meanByAxis.conciseness * 100) / 100,
      },
      grades,
      totalCostUsd: Math.round(totalCost * 1000) / 1000,
    },
  };

  await writeFile(
    join(EVALS_ROOT, "results.json"),
    JSON.stringify(out, null, 2) + "\n",
    "utf8"
  );

  console.log("\n✦ Eval complete.");
  console.log(`  Mean: ${out.aggregate.meanTotal}/20`);
  console.log(`  Grades: A=${grades.A} B=${grades.B} C=${grades.C} D=${grades.D}`);
  console.log(`  Cost: $${out.aggregate.totalCostUsd}`);
  console.log(`  Results: ${join(EVALS_ROOT, "results.json")}`);
}

interface GraderResponse extends AxisScores {
  notes: Record<keyof AxisScores, string>;
}

function extractJson(text: string): GraderResponse | null {
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) return null;
  cleaned = cleaned.slice(first, last + 1);
  try {
    return JSON.parse(cleaned) as GraderResponse;
  } catch {
    return null;
  }
}

main().catch((err) => {
  console.error("✖ Eval failed:", err);
  process.exit(1);
});

// Suppress unused import warning — needed for tsx esm setup
void mkdir;
void resolve;
