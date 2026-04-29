// Core types for the multi-stage extraction pipeline.
// Every stage produces a typed output that can be inspected, tested, and audited.

import type { SourceType } from "../types";

export type FactType =
  | "policy"
  | "procedure"
  | "decision"
  | "constraint"
  | "person"
  | "system"
  | "deprecated";

export interface PipelineSource {
  type: SourceType;
  // Slack channel, GitHub repo path, Notion page ID, etc.
  locator?: string;
  // Display title for provenance
  title?: string;
  // Author / posted-by, for authority scoring
  author?: string;
  authorRole?: string;
  // ISO timestamp when this content was last meaningfully changed
  updatedAt?: string;
  // ISO timestamp when this content was originally posted
  createdAt?: string;
  // External URL to view the source
  url?: string;
}

export interface PipelineInput {
  text: string;
  hint?: string;
  source?: PipelineSource;
  metadata?: Record<string, unknown>;
}

// ---- Stage 1: Chunking ----

export interface Chunk {
  id: string;
  index: number;
  text: string;
  // Inherited source for provenance
  source?: PipelineSource;
  // Best-effort timestamp inferred from chunk content (e.g., a Slack date stamp)
  inferredDate?: string;
}

// ---- Stage 2: Candidate facts ----

export interface CandidateFact {
  // Stable but provisional ID
  id: string;
  type: FactType;
  topic: string;
  statement: string;
  // Direct quote from the source backing this fact
  evidenceQuote: string;
  // The chunk this fact came from
  chunkId: string;
  // 0-1, model's confidence at extraction time
  confidence: number;
  // Authority score 0-1, derived from source type + role + recency
  authorityScore: number;
  // Inferred date for the fact (most recent relevant date in or near the chunk)
  inferredDate?: string;
}

// ---- Stage 3: Clustered facts ----

export interface ClusteredFact {
  // The cluster representative
  representative: CandidateFact;
  // Other candidates that were merged into this cluster
  members: CandidateFact[];
  // True if all members agree; false if cluster surfaced disagreement
  internallyConsistent: boolean;
}

// ---- Stage 4: Resolved facts ----

export type ConflictKind =
  | "contradicts"
  | "supersedes"
  | "narrower-of"
  | "wider-of";

export interface Conflict {
  factIdA: string;
  factIdB: string;
  kind: ConflictKind;
  rationale: string;
}

export interface ResolvedFact {
  id: string;
  type: FactType;
  topic: string;
  statement: string;
  evidence: Array<{
    chunkId: string;
    quote: string;
    confidence: number;
  }>;
  // Final rank 0-1 after recency + authority + consistency weighting
  finalRank: number;
  // IDs of facts this one supersedes (overrides as more recent / authoritative)
  supersedes: string[];
  // IDs of facts this conflicts with that we did NOT auto-resolve
  unresolvedConflicts: string[];
  // Composite authority score
  authorityScore: number;
  // Latest known date from evidence
  effectiveDate?: string;
}

// ---- Stage 5: Synthesized skill ----

export interface SynthesizedSkill {
  name: string;
  description: string;
  body: string;
  raw: string; // full SKILL.md including frontmatter
  factIds: string[]; // facts that were synthesized into this skill
}

// ---- Stage 6: Validation ----

export type ValidationSeverity = "error" | "warning" | "info";

export interface ValidationIssue {
  severity: ValidationSeverity;
  rule: string;
  message: string;
  location?: string;
}

export interface ValidationResult {
  valid: boolean; // true if no errors (warnings allowed)
  issues: ValidationIssue[];
}

// ---- Pipeline trace ----

export interface PipelineTrace {
  startedAt: string;
  finishedAt?: string;
  stages: Array<{
    name: string;
    durationMs: number;
    status: "ok" | "error";
    error?: string;
  }>;
  totalCostUsd: number;
  modelUsage: Array<{
    model: string;
    inputTokens: number;
    outputTokens: number;
    purpose: string;
  }>;
}

// ---- Final pipeline output ----

export interface PipelineResult {
  topic: string;
  chunks: Chunk[];
  candidateFacts: CandidateFact[];
  clusters: ClusteredFact[];
  resolvedFacts: ResolvedFact[];
  conflicts: Conflict[];
  skill: SynthesizedSkill;
  validation: ValidationResult;
  trace: PipelineTrace;
}

// ---- Pipeline options ----

export interface PipelineOptions {
  apiKey?: string;
  // Force specific models per stage
  extractModel?: string;
  synthesisModel?: string;
  // Skip stages for cost/latency
  skipClustering?: boolean;
  skipConflictResolution?: boolean;
  // Maximum chunks to process (for very large inputs)
  maxChunks?: number;
  // Progress callback
  onStage?: (stage: string, status: "start" | "ok" | "error") => void;
  onCandidateFact?: (fact: CandidateFact) => void;
  onSkillDelta?: (text: string) => void;
}
