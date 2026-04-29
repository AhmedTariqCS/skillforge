import type { PipelineSource, FactType } from "./types";

// Authority scoring is the soul of the contrarian claim:
// "policy docs as ground truth, Slack as noise" is the wrong default.
// We weight by:
//   - Recency (more recent = higher)
//   - Source type (Slack announcements weighed above older Notion docs by default,
//                  inverted only when the Notion doc is more recent than the Slack thread)
//   - Author role (VP/CEO statements weighed above IC opinions, when role is known)
//   - Fact type (constraints weighed above policies, decisions above procedures)
//
// The output is a 0..1 score. Resolve.ts uses this to rank when facts cluster
// or conflict.

interface AuthorityInputs {
  source?: PipelineSource;
  inferredDate?: string;
  factType: FactType;
  // Confidence the model assigned at extraction time
  modelConfidence: number;
  // Reference time (default: now). Recency is computed relative to this.
  asOf?: Date;
}

const SOURCE_BASE: Partial<Record<PipelineSource["type"], number>> = {
  // Slack carries higher base authority than long-form docs because
  // it's where decisions actually get made (and overridden) in real time.
  slack: 0.55,
  // GitHub post-mortems and runbook PRs are codified, signed-off knowledge.
  github: 0.7,
  // Notion / wikis are generally rolled-forward summaries that lag reality.
  notion: 0.45,
  // Drive docs sit between Slack and Notion in our experience.
  drive: 0.5,
  // Intercom / support tickets capture worked examples — high authority for
  // customer-facing decisions.
  intercom: 0.65,
  linear: 0.55,
  email: 0.4,
};

const FACT_TYPE_BIAS: Record<FactType, number> = {
  // Hard rules (constraints) are the most valuable: they encode learned-the-hard-way wisdom.
  constraint: 0.15,
  decision: 0.1,
  policy: 0.05,
  procedure: 0.0,
  person: 0.0,
  system: 0.0,
  deprecated: -0.2,
};

const ROLE_BIAS: Array<{ pattern: RegExp; bias: number }> = [
  { pattern: /CEO|founder|cofounder/i, bias: 0.12 },
  { pattern: /CTO|VP|head of|chief/i, bias: 0.08 },
  { pattern: /staff|principal/i, bias: 0.05 },
  { pattern: /senior|lead/i, bias: 0.03 },
  { pattern: /intern|junior/i, bias: -0.05 },
];

export function scoreAuthority(inputs: AuthorityInputs): number {
  const { source, inferredDate, factType, modelConfidence } = inputs;
  const asOf = inputs.asOf ?? new Date();

  let score = SOURCE_BASE[source?.type ?? "drive"] ?? 0.5;

  // Recency boost — facts dated within 90 days get a +0.15 boost,
  // older ones decay linearly to 0 over 2 years.
  if (inferredDate) {
    const dateMs = new Date(inferredDate).getTime();
    if (!isNaN(dateMs)) {
      const ageDays = (asOf.getTime() - dateMs) / (1000 * 60 * 60 * 24);
      if (ageDays < 90) {
        score += 0.15;
      } else if (ageDays < 730) {
        const decay = 0.15 * (1 - (ageDays - 90) / 640);
        score += Math.max(0, decay);
      }
      // Older than 2 years: no recency boost
    }
  }

  // Author role bias
  if (source?.authorRole) {
    for (const { pattern, bias } of ROLE_BIAS) {
      if (pattern.test(source.authorRole)) {
        score += bias;
        break;
      }
    }
  }

  // Fact-type bias
  score += FACT_TYPE_BIAS[factType];

  // Confidence multiplier — bound to a small range so it doesn't dominate
  score = score * (0.85 + 0.15 * modelConfidence);

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, score));
}

// Compute final rank for a fact given its evidence ages and authorities.
// Used in stage 4 to break ties / order facts in the synthesized skill.
export function finalRank(authorityScore: number, modelConfidence: number): number {
  return 0.7 * authorityScore + 0.3 * modelConfidence;
}
