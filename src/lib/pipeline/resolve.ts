import { finalRank } from "./authority";
import type {
  ClusteredFact,
  Conflict,
  ResolvedFact,
} from "./types";

// Stage 4: conflict resolution + final ranking.
// For each cluster:
//   - Pick the highest-authority member as the canonical statement.
//   - Note other members as supporting evidence.
//   - If the cluster is internally inconsistent, flag a conflict.
// Across clusters of the same topic+type:
//   - Detect supersession (older deprecated by newer).
//   - Detect cross-cluster contradictions.
//
// This is where the "Slack as ground truth" weighting actually pays off:
// recent Slack announcements outrank older Notion docs on the same topic
// when their authority scores diverge.

export interface ResolveOutput {
  resolvedFacts: ResolvedFact[];
  conflicts: Conflict[];
}

export function resolve(clusters: ClusteredFact[]): ResolveOutput {
  const resolvedFacts: ResolvedFact[] = clusters.map((c) =>
    clusterToResolved(c)
  );

  const conflicts: Conflict[] = [];

  // Detect supersession: deprecated type, OR newer fact same topic+type with much higher rank
  for (let i = 0; i < resolvedFacts.length; i++) {
    for (let j = 0; j < resolvedFacts.length; j++) {
      if (i === j) continue;
      const a = resolvedFacts[i];
      const b = resolvedFacts[j];
      if (a.topic !== b.topic) continue;
      if (a.type !== b.type) continue;

      // Direct deprecation marker
      if (b.type === "deprecated") {
        if (!a.supersedes.includes(b.id)) a.supersedes.push(b.id);
        continue;
      }

      // Supersession by recency: same topic+type, A's effective date materially later than B's
      const aDate = a.effectiveDate ? new Date(a.effectiveDate).getTime() : NaN;
      const bDate = b.effectiveDate ? new Date(b.effectiveDate).getTime() : NaN;
      if (
        !isNaN(aDate) &&
        !isNaN(bDate) &&
        aDate > bDate + 1000 * 60 * 60 * 24 * 30 && // a is at least 30 days newer
        a.authorityScore >= b.authorityScore
      ) {
        if (!a.supersedes.includes(b.id)) a.supersedes.push(b.id);
        conflicts.push({
          factIdA: a.id,
          factIdB: b.id,
          kind: "supersedes",
          rationale: `A is more recent than B (Δ ${Math.round(
            (aDate - bDate) / (1000 * 60 * 60 * 24)
          )}d) and at least as authoritative`,
        });
      }
    }
  }

  // Cross-cluster contradiction detection: same topic+type clusters that
  // disagree numerically without supersession.
  for (let i = 0; i < resolvedFacts.length; i++) {
    for (let j = i + 1; j < resolvedFacts.length; j++) {
      const a = resolvedFacts[i];
      const b = resolvedFacts[j];
      if (a.topic !== b.topic) continue;
      if (a.type !== b.type) continue;

      const aNums = extractNumbers(a.statement);
      const bNums = extractNumbers(b.statement);
      if (aNums.length === 0 || bNums.length === 0) continue;

      const overlap = aNums.some((x) => bNums.includes(x));
      if (overlap) continue;

      // Different numbers, neither supersedes the other → flag
      const alreadySupersession =
        a.supersedes.includes(b.id) || b.supersedes.includes(a.id);
      if (alreadySupersession) continue;

      conflicts.push({
        factIdA: a.id,
        factIdB: b.id,
        kind: "contradicts",
        rationale: `Different numeric thresholds for the same topic (${a.topic}) without explicit supersession`,
      });
      a.unresolvedConflicts.push(b.id);
      b.unresolvedConflicts.push(a.id);
    }
  }

  // Final ranking pass — boost facts that supersede others
  for (const f of resolvedFacts) {
    if (f.supersedes.length > 0) {
      f.finalRank = Math.min(1, f.finalRank + 0.05 * f.supersedes.length);
    }
    if (f.unresolvedConflicts.length > 0) {
      // Conflicts dock confidence; we still surface but flag for review
      f.finalRank = Math.max(0, f.finalRank - 0.05);
    }
  }

  resolvedFacts.sort((a, b) => b.finalRank - a.finalRank);

  return { resolvedFacts, conflicts };
}

function clusterToResolved(cluster: ClusteredFact): ResolvedFact {
  const rep = cluster.representative;
  const allMembers = cluster.members;
  const meanConfidence =
    allMembers.reduce((s, f) => s + f.confidence, 0) / allMembers.length;

  // Pick the latest effective date across the cluster
  const dates = allMembers
    .map((m) => (m.inferredDate ? new Date(m.inferredDate).getTime() : NaN))
    .filter((n) => !isNaN(n));
  const latest = dates.length > 0 ? new Date(Math.max(...dates)) : undefined;

  return {
    id: `fact-${rep.id}`,
    type: rep.type,
    topic: rep.topic,
    statement: rep.statement,
    evidence: allMembers.map((m) => ({
      chunkId: m.chunkId,
      quote: m.evidenceQuote,
      confidence: m.confidence,
    })),
    finalRank: finalRank(rep.authorityScore, meanConfidence),
    supersedes: [],
    unresolvedConflicts: [],
    authorityScore: rep.authorityScore,
    effectiveDate: latest?.toISOString(),
  };
}

function extractNumbers(s: string): number[] {
  const matches = s.match(/\$?\d+(?:,\d{3})*(?:\.\d+)?%?/g);
  if (!matches) return [];
  return matches.map((m) => parseFloat(m.replace(/[$,%]/g, "")));
}
