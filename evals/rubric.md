# Skillforge extraction quality rubric

The grader scores every generated SKILL.md on four axes. Each axis is 1-5; total
is summed (max 20). Letter grade: A ≥ 17, B 13-16, C 9-12, D < 9.

Used by `evals/run.ts`. Also serialized into the grader prompt so the model
applies the same rubric a human would.

## 1. Faithfulness (1-5)

Does the skill match what's actually in the source? Penalize invented facts,
contradictions with the source, or missing critical rules.

- **5** — Every claim is grounded in the source. Hard rules carried through verbatim.
- **4** — All material claims grounded. May add reasonable inference (e.g., implied procedure).
- **3** — Mostly faithful, with one minor invented detail or unstated assumption.
- **2** — Multiple invented facts, or one critical hard-rule miss.
- **1** — Substantively contradicts the source.

## 2. Executability (1-5)

Can an agent actually follow this and make a correct decision, or do they need
to re-read the source? The skill should be self-contained.

- **5** — Agent can act on the skill alone. Decisions are precise (numbers, names, thresholds).
- **4** — Agent can act in most cases. One vague step or missing threshold.
- **3** — Agent has the framework but would need to look up specific values.
- **2** — Agent learns the topic but cannot make a confident decision.
- **1** — Generic guidance only — no operational detail.

## 3. Format compliance (1-5)

Does the SKILL.md follow Anthropic's Agent Skills format spec?
- YAML frontmatter parses
- `name`: lowercase-hyphens, ≤64 chars, no reserved words ("anthropic", "claude")
- `description`: ≤1024 chars, third person, includes both what the skill does AND when to use it
- No XML tags
- No time-sensitive language ("currently", "next week", "tomorrow")
- Body ≤500 lines
- Forward slashes in paths

- **5** — Fully compliant. Name is gerund. Description is third person + when-to-use. Frontmatter parses. No time-sensitive text.
- **4** — Compliant with one minor deviation (e.g., name not gerund but valid format).
- **3** — Two minor deviations or one moderate one.
- **2** — Multiple format violations.
- **1** — Frontmatter malformed or missing required fields.

## 4. Conciseness (1-5)

Is it appropriately brief? Long skills cost more tokens and dilute attention.
Excellent skills hit the right details and stop.

- **5** — Every section earns its place. No redundancy.
- **4** — Tight overall, with one or two passages that could be trimmed.
- **3** — Has filler — generic preamble, redundant examples, or stating the obvious.
- **2** — Substantial filler. Body rambles.
- **1** — Bloated. Half could be removed without losing information.

## Grader instructions

When you grade, you're given:
- The original source text
- A hand-written reference SKILL.md (what an ideal compiler would produce)
- The generated SKILL.md from the pipeline under test

Grade the **generated** SKILL.md, not the reference. Use the reference as a
benchmark for what's possible from this input.

For each axis, output:
- An integer 1-5
- One sentence explaining the score (cite specific sections of the generated skill)

Be honest. If the generated skill is bad, score it that way. We use these
numbers to improve the pipeline.
