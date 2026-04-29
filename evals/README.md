# Skillforge eval suite

A reproducible benchmark for the Skillforge extraction pipeline. Anyone with an
Anthropic API key can run this and grade the same outputs we do.

## Why this exists

Most "AI for the enterprise" startups claim quality without showing receipts.
We built a 10-case benchmark, hand-wrote reference SKILL.md files, and run our
pipeline against them. Results are auto-graded by a separate Claude pass against
a 4-axis rubric, then surfaced on `/research`.

This makes our quality claims falsifiable. If you run the suite and our scores
don't reproduce, we hear about it.

## Layout

```
evals/
├── README.md                      # this file
├── cases/                         # input + reference per case
│   ├── 01-deploy-freeze/
│   │   ├── input.md               # raw Slack thread
│   │   ├── meta.json              # source metadata (type, author, date)
│   │   └── reference.md           # hand-written reference SKILL.md
│   ├── 02-cache-incident/
│   │   ├── input.md
│   │   ├── meta.json
│   │   └── reference.md
│   └── ...
├── rubric.md                      # the 4-axis rubric (faithfulness, executability, format, conciseness)
├── run.ts                         # eval runner — runs pipeline + grader on every case
└── results.json                   # latest results (committed for transparency)
```

## How to run

```bash
# From repo root
export ANTHROPIC_API_KEY=sk-ant-...
npm run eval
```

This will:

1. Walk `evals/cases/`.
2. For each case, run the Skillforge pipeline against `input.md` (with `meta.json` as source metadata).
3. Write the generated SKILL.md to `cases/XX/generated.md`.
4. Run the grader (Claude Opus, separate prompt) which reads input, reference, and generated, and scores the generated on the rubric (1-5 each axis).
5. Write `results.json` with per-case scores and aggregate stats.

Typical full-suite cost: about **$2.40** on the current models.

## How the grader works

The grader is given:
- The original input text
- The hand-written reference SKILL.md
- The generated SKILL.md from our pipeline

It returns scores 1-5 on each of the 4 axes (faithfulness, executability,
format, conciseness) plus a 1-line note explaining each score. Total per case
is sum of axes (max 20). Letter grades: A (≥17), B (13-16), C (9-12), D (<9).

The grader prompt is in `run.ts`. We deliberately use a different model and
prompt than the synthesizer to avoid grader bias.

## Reading the results

`results.json` is committed after every full run. Schema:

```json
{
  "runAt": "2026-04-29T22:31:00.000Z",
  "model": {
    "extract": "claude-haiku-4-5",
    "synthesize": "claude-opus-4-7",
    "grade": "claude-opus-4-7"
  },
  "cases": [
    {
      "id": "01-deploy-freeze",
      "domain": "deploys",
      "inputType": "slack",
      "difficulty": "medium",
      "skillName": "handling-deploy-freezes",
      "score": { "faithfulness": 5, "executability": 5, "format": 5, "conciseness": 4, "total": 19, "grade": "A" },
      "notes": "Captured both hard rules. Strong example coverage.",
      "costUsd": 0.143
    }
  ],
  "aggregate": {
    "n": 10,
    "meanTotal": 17.9,
    "meanByAxis": { "faithfulness": 4.5, "executability": 4.6, "format": 4.9, "conciseness": 4.4 },
    "grades": { "A": 7, "B": 2, "C": 1, "D": 0 },
    "totalCostUsd": 2.43
  }
}
```

## Contributing a case

1. Create `evals/cases/NN-short-name/`.
2. Add `input.md` (the raw source).
3. Add `meta.json` with `type`, `author`, `authorRole`, `updatedAt`.
4. Hand-write `reference.md` — what an ideal compiler would produce. Follow Anthropic's
   Agent Skills format spec.
5. Submit a PR. We re-run the suite and update `results.json`.

Cases that exercise different difficulty axes are most valuable: long inputs,
ambiguous policies, conflicting facts across sources, multi-language, technical
domains.

## Known limits

- Single-document only. The full Skillforge product synthesizes across multiple
  sources — that's not in this benchmark yet.
- Grader is Claude Opus. We've spot-checked vs human graders on 30 outputs and
  found avg disagreement of 0.4 points across axes. Acceptable for a relative
  benchmark; not gospel.
- 10 cases is small. We're growing toward 50.
