// Evaluation rubric for scoring generated SKILL.md files.
// Each generated skill is scored on four axes (1-5 each).
// Total possible: 20. We grade A (≥17), B (13-16), C (9-12), D (<9).

export interface RubricScore {
  faithfulness: number; // 1-5
  executability: number; // 1-5
  format: number; // 1-5
  conciseness: number; // 1-5
}

export interface RubricResult extends RubricScore {
  total: number;
  grade: "A" | "B" | "C" | "D";
  notes: string;
}

export const RUBRIC_DEFINITION = {
  faithfulness: {
    name: "Faithfulness",
    description:
      "Does the skill match what's actually in the source? Penalize invented facts, contradictions with the source, or missing critical rules.",
    scale: {
      5: "Every claim is grounded in the source. Hard rules carried through verbatim.",
      4: "All material claims grounded. May add reasonable inference (e.g., implied procedure).",
      3: "Mostly faithful, with one minor invented detail or unstated assumption.",
      2: "Multiple invented facts, or one critical hard-rule miss.",
      1: "Substantively contradicts the source.",
    },
  },
  executability: {
    name: "Executability",
    description:
      "Can an agent actually follow this and make a correct decision, or do they need to re-read the source? The skill should be self-contained.",
    scale: {
      5: "Agent can act on the skill alone. Decisions are precise (numbers, names, thresholds).",
      4: "Agent can act in most cases. One vague step or missing threshold.",
      3: "Agent has the framework but would need to look up specific values.",
      2: "Agent learns the topic but cannot make a confident decision.",
      1: "Generic guidance only — no operational detail.",
    },
  },
  format: {
    name: "Format compliance",
    description:
      "Does it follow Anthropic's Agent Skills format spec? YAML frontmatter, gerund-form name, third-person description, ≤500 lines, no time-sensitive language.",
    scale: {
      5: "Fully compliant. Name is gerund, description is third person + when-to-use, frontmatter parses, no time-sensitive text.",
      4: "Compliant with one minor deviation (e.g., name not gerund but valid).",
      3: "Two minor deviations or one moderate one.",
      2: "Multiple format violations.",
      1: "Frontmatter malformed or missing required fields.",
    },
  },
  conciseness: {
    name: "Conciseness",
    description:
      "Is it appropriately brief? Long skills cost more tokens and dilute attention. Excellent skills hit the right details and stop.",
    scale: {
      5: "Every section earns its place. No redundancy.",
      4: "Tight overall, with one or two passages that could be trimmed.",
      3: "Has filler — generic preamble, redundant examples, or stating the obvious.",
      2: "Substantial filler. Body rambles.",
      1: "Bloated. Half could be removed without losing information.",
    },
  },
} as const;

export function gradeFromTotal(total: number): RubricResult["grade"] {
  if (total >= 17) return "A";
  if (total >= 13) return "B";
  if (total >= 9) return "C";
  return "D";
}

export function summary(score: RubricScore, notes: string): RubricResult {
  const total =
    score.faithfulness +
    score.executability +
    score.format +
    score.conciseness;
  return {
    ...score,
    total,
    grade: gradeFromTotal(total),
    notes,
  };
}
