// Multi-stage extraction pipeline orchestrator.
// Stages: chunk → extract per-chunk → cluster → resolve conflicts → synthesize → validate

import { chunk } from "./chunk";
import { extractFromChunk } from "./extract";
import { clusterFacts } from "./cluster";
import { resolve } from "./resolve";
import { synthesize } from "./synthesize";
import { validate } from "./validate";
import type {
  PipelineInput,
  PipelineOptions,
  PipelineResult,
  PipelineTrace,
  CandidateFact,
} from "./types";

// Approximate per-token costs (in USD). Used for trace cost reporting.
const COST_PER_TOKEN: Record<string, { input: number; output: number }> = {
  // claude-haiku-4-5-* (illustrative — actual rates may vary)
  "haiku": { input: 0.8 / 1_000_000, output: 4 / 1_000_000 },
  "sonnet": { input: 3 / 1_000_000, output: 15 / 1_000_000 },
  "opus": { input: 15 / 1_000_000, output: 75 / 1_000_000 },
};

function tierFor(modelId?: string): keyof typeof COST_PER_TOKEN {
  if (!modelId) return "haiku";
  if (/opus/i.test(modelId)) return "opus";
  if (/sonnet/i.test(modelId)) return "sonnet";
  return "haiku";
}

export async function runPipeline(
  input: PipelineInput,
  opts: PipelineOptions = {}
): Promise<PipelineResult> {
  const trace: PipelineTrace = {
    startedAt: new Date().toISOString(),
    stages: [],
    totalCostUsd: 0,
    modelUsage: [],
  };
  const trackStage = async <T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> => {
    const t0 = Date.now();
    opts.onStage?.(name, "start");
    try {
      const out = await fn();
      trace.stages.push({
        name,
        durationMs: Date.now() - t0,
        status: "ok",
      });
      opts.onStage?.(name, "ok");
      return out;
    } catch (err) {
      trace.stages.push({
        name,
        durationMs: Date.now() - t0,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
      opts.onStage?.(name, "error");
      throw err;
    }
  };

  // ---- Stage 1: chunk ----
  let chunks = await trackStage("chunk", () => chunk(input));
  if (opts.maxChunks && chunks.length > opts.maxChunks) {
    chunks = chunks.slice(0, opts.maxChunks);
  }

  // ---- Stage 2: extract candidate facts (parallel per chunk) ----
  const candidateFacts: CandidateFact[] = [];
  let topic = "general";
  await trackStage("extract", async () => {
    const results = await Promise.all(
      chunks.map((c) =>
        extractFromChunk(c, input.source, {
          apiKey: opts.apiKey,
          model: opts.extractModel,
        })
      )
    );
    for (const r of results) {
      candidateFacts.push(...r.facts);
      if (r.topic && r.topic !== "general") topic = r.topic;
      const tier = tierFor(opts.extractModel);
      const cost =
        r.inputTokens * COST_PER_TOKEN[tier].input +
        r.outputTokens * COST_PER_TOKEN[tier].output;
      trace.modelUsage.push({
        model: opts.extractModel ?? "claude-haiku",
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        purpose: "extract",
      });
      trace.totalCostUsd += cost;
    }
    for (const f of candidateFacts) opts.onCandidateFact?.(f);
  });

  // ---- Stage 3: cluster ----
  const clusters = opts.skipClustering
    ? candidateFacts.map((f) => ({
        representative: f,
        members: [f],
        internallyConsistent: true,
      }))
    : await trackStage("cluster", () => clusterFacts(candidateFacts));

  // ---- Stage 4: resolve ----
  const { resolvedFacts, conflicts } = opts.skipConflictResolution
    ? {
        resolvedFacts: clusters.map((c) => ({
          id: `fact-${c.representative.id}`,
          type: c.representative.type,
          topic: c.representative.topic,
          statement: c.representative.statement,
          evidence: c.members.map((m) => ({
            chunkId: m.chunkId,
            quote: m.evidenceQuote,
            confidence: m.confidence,
          })),
          finalRank: c.representative.authorityScore,
          supersedes: [],
          unresolvedConflicts: [],
          authorityScore: c.representative.authorityScore,
          effectiveDate: c.representative.inferredDate,
        })),
        conflicts: [],
      }
    : await trackStage("resolve", () => resolve(clusters));

  // ---- Stage 5: synthesize ----
  const synth = await trackStage("synthesize", () =>
    synthesize(topic, resolvedFacts, conflicts, input.text, {
      apiKey: opts.apiKey,
      model: opts.synthesisModel,
      onDelta: opts.onSkillDelta,
    })
  );
  const tier = tierFor(opts.synthesisModel);
  trace.totalCostUsd +=
    synth.inputTokens * COST_PER_TOKEN[tier].input +
    synth.outputTokens * COST_PER_TOKEN[tier].output;
  trace.modelUsage.push({
    model: opts.synthesisModel ?? "claude-opus",
    inputTokens: synth.inputTokens,
    outputTokens: synth.outputTokens,
    purpose: "synthesize",
  });

  // ---- Stage 6: validate ----
  const validation = await trackStage("validate", () => validate(synth.skill));

  trace.finishedAt = new Date().toISOString();

  return {
    topic,
    chunks,
    candidateFacts,
    clusters,
    resolvedFacts,
    conflicts,
    skill: synth.skill,
    validation,
    trace,
  };
}

export * from "./types";
export { chunk } from "./chunk";
export { extractFromChunk } from "./extract";
export { clusterFacts } from "./cluster";
export { resolve } from "./resolve";
export { synthesize } from "./synthesize";
export { validate, formatValidation } from "./validate";
export { scoreAuthority, finalRank } from "./authority";
