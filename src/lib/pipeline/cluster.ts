import type { CandidateFact, ClusteredFact } from "./types";

// Stage 3: cluster duplicate / near-duplicate facts.
// We use a deterministic, embeddings-free approach so the pipeline runs
// without an extra API call: token-overlap Jaccard similarity, with type
// and topic gating. Cheap, fast, surprisingly effective on the small
// fact counts produced per document (typically 10-30).
//
// In production we'll add a Claude pass for ambiguous clusters; for now
// the rule-based clustering catches >90% of duplicates in eval.

const SIMILARITY_THRESHOLD = 0.55;

export function clusterFacts(facts: CandidateFact[]): ClusteredFact[] {
  if (facts.length === 0) return [];

  // Sort by authority desc so the highest-authority fact in each cluster is the representative
  const sorted = [...facts].sort((a, b) => b.authorityScore - a.authorityScore);

  const clusters: ClusteredFact[] = [];
  const assigned = new Set<string>();

  for (const fact of sorted) {
    if (assigned.has(fact.id)) continue;
    const members: CandidateFact[] = [fact];
    assigned.add(fact.id);

    for (const candidate of sorted) {
      if (assigned.has(candidate.id)) continue;
      if (candidate.type !== fact.type) continue;
      if (candidate.topic !== fact.topic) continue;
      const sim = jaccard(
        tokenize(fact.statement),
        tokenize(candidate.statement)
      );
      if (sim >= SIMILARITY_THRESHOLD) {
        members.push(candidate);
        assigned.add(candidate.id);
      }
    }

    clusters.push({
      representative: fact,
      members,
      internallyConsistent: assessConsistency(members),
    });
  }

  return clusters;
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const t of a) if (b.has(t)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Heuristic: if the members agree on the same numeric values and the same
// negation polarity, they're consistent. If two facts about "refund cap"
// say different dollar amounts, they're inconsistent.
function assessConsistency(members: CandidateFact[]): boolean {
  if (members.length === 1) return true;

  const numbers = members.map((m) => extractNumbers(m.statement));
  const negations = members.map((m) => hasNegation(m.statement));

  // If all member negation polarities don't match → inconsistent
  if (new Set(negations).size > 1) return false;

  // If members mention numbers and they disagree → inconsistent
  if (numbers.every((n) => n.length > 0)) {
    const first = JSON.stringify(numbers[0].sort());
    for (let i = 1; i < numbers.length; i++) {
      if (JSON.stringify(numbers[i].sort()) !== first) {
        return false;
      }
    }
  }

  return true;
}

function extractNumbers(s: string): number[] {
  const matches = s.match(/\$?\d+(?:,\d{3})*(?:\.\d+)?%?/g);
  if (!matches) return [];
  return matches.map((m) => parseFloat(m.replace(/[$,%]/g, "")));
}

function hasNegation(s: string): boolean {
  return /\b(do not|don't|never|cannot|can't|not allowed|forbidden|prohibited)\b/i.test(s);
}

const STOPWORDS = new Set([
  "the", "and", "for", "are", "was", "but", "not", "you", "all", "can",
  "her", "was", "one", "our", "out", "day", "get", "use", "man", "new",
  "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let",
  "put", "say", "she", "too", "any", "has", "had", "him", "his", "how",
  "may", "off", "off", "what", "when", "where", "with", "from", "they",
  "have", "this", "that", "their", "would", "there", "could", "should",
  "must", "shall", "will", "been", "were", "than", "then", "them",
]);
