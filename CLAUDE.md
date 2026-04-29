# Skillforge — project guide for Claude

This is Ahmed Tariq's YC Summer 2026 application against Tom Blomfield's "Company Brain" RFS. The product is a real, deployable Next.js app that compiles scattered company knowledge (Slack, Notion, GitHub, Intercom) into executable Claude Agent Skills (SKILL.md files).

**Deadline:** May 4, 2026 8pm PT.

## Architecture overview

- **Frontend + backend:** Next.js 16 App Router, Tailwind CSS v4, Anthropic SDK, Drizzle + Neon Postgres + pgvector (optional).
- **Models:** Claude Opus 4.7 for high-quality skill synthesis, Sonnet 4.6 for the live agent demo, Haiku 4.5 for fact extraction.
- **Deployment:** Vercel. Edge runtime for OG image + favicon. Node runtime for everything else.

## Key surfaces

| Route | What it does |
|-------|--------------|
| `/` | Landing — animated hero, stats banner, Forge teaser, "why we'll win" |
| `/demo` | Side-by-side streaming agent: with-brain vs without-brain |
| `/forge` | **Live compiler.** User pastes raw text, real Claude calls extract facts and synthesize a SKILL.md, streamed |
| `/skills` + `/skills/[name]` | Library of generated SKILL.md files. Detail page has raw/rendered toggle, copy, download |
| `/sources` + `/sources/[id]` | The 19 source docs that produced the skills. Each links back to skills it shaped |
| `/manifesto` | Long-form vision |
| `/pricing` | Per-company pricing tiers + FAQ |
| `/about` | Ahmed's founder story |

## Code map

```
src/
├── app/
│   ├── api/
│   │   ├── agent/run/route.ts   # SSE: with-brain + without-brain side-by-side stream
│   │   ├── forge/extract/route.ts # SSE: live extraction (facts + skill synthesis)
│   │   ├── skills/[name]/route.ts # GET single skill
│   │   ├── skills/route.ts        # GET skill list
│   │   ├── sources/[id]/route.ts  # GET single source doc
│   │   ├── sources/route.ts       # GET sources index
│   │   ├── scenarios/route.ts     # GET demo scenarios
│   │   └── waitlist/route.ts      # POST waitlist signup
│   ├── (page routes above)
│   ├── error.tsx                # global error boundary
│   ├── not-found.tsx            # custom 404
│   ├── icon.tsx                 # generated favicon (Edge runtime)
│   ├── opengraph-image.tsx      # generated OG image (Edge runtime)
│   ├── robots.ts                # robots.txt generator
│   └── sitemap.ts               # sitemap.xml generator
├── components/
│   ├── ui/                      # button, card, badge, input, textarea
│   ├── demo-client.tsx          # the side-by-side agent UI (client component, SSE consumer)
│   ├── forge-client.tsx         # the live compiler UI (client component, SSE consumer)
│   ├── hero-visual.tsx          # animated source-cards → SKILL.md visualization
│   ├── stats-banner.tsx         # scroll-triggered animated stat counters
│   ├── skill-view.tsx           # raw/rendered toggle + copy + download for a SKILL.md
│   ├── header.tsx               # top nav (with mobile-nav.tsx)
│   ├── footer.tsx
│   ├── waitlist-form.tsx
│   ├── markdown.tsx             # styled react-markdown wrapper
│   ├── source-icon.tsx          # branded icons for slack/notion/etc
│   └── logo.tsx
└── lib/
    ├── agent.ts                 # with-brain / without-brain runners + streaming
    ├── claude.ts                # Anthropic SDK wrapper + model constants
    ├── forge.ts                 # extraction + synthesis pipeline (used by /forge)
    ├── types.ts                 # shared types (SourceDoc, ExtractedFact, AgentSkill, etc.)
    ├── utils.ts                 # cn(), formatRelativeTime, truncate
    ├── db/
    │   ├── client.ts            # Neon-backed Drizzle (graceful when DB missing)
    │   └── schema.ts            # sources, documents, facts (vector), skills, agent_runs, waitlist
    └── seed/
        ├── northwind.ts         # 20 demo source docs + scenarios + sources summary
        ├── facts.ts             # 18 pre-extracted facts with provenance
        ├── skills.ts            # 7 pre-generated SKILL.md files
        └── forge-samples.ts     # 3 sample inputs for the /forge page
```

## How the side-by-side demo works

1. User picks a scenario or types a prompt.
2. Client POSTs to `/api/agent/run` with `{ prompt, scenarioId? }`.
3. Route opens an SSE stream.
4. Two parallel streams run via `streamWithBrain` and `streamWithoutBrain` from `lib/agent.ts`.
5. `streamWithBrain` either uses `forceSkills` from the scenario, a keyword-heuristic match against skill descriptions, or a Haiku triage call to pick the most relevant skills. The skills are inlined into the system prompt.
6. Both streams emit `with_delta` and `without_delta` events that the client renders in real time.
7. On completion, `*_done` events report latency, token counts, skills used, cited doc IDs.

## How /forge works

1. User pastes text (80–12,000 chars).
2. Client POSTs to `/api/forge/extract`.
3. Server runs Haiku for fact extraction (returns JSON), reveals facts one at a time over SSE.
4. Server then streams Opus for SKILL.md synthesis, token by token.
5. Client builds the skill view incrementally, then offers copy / download.

## Data conventions

- Skills follow Claude Agent Skills format: lowercase-hyphens gerund names (max 64 chars), third-person descriptions (max 1024 chars), bodies under 500 lines.
- Facts have provenance: every fact lists `evidence: [{ docId, quote, confidence }]`.
- Source docs have stable IDs that survive prerender.

## Things to NOT change without thinking

- The Claude Agent Skills format constraints (64-char names, gerund form, third-person desc). These are validated by Anthropic's runtime.
- The SSE event names — they're consumed by client components and need to match.
- The seed dataset's tone — it deliberately feels like real B2B SaaS company data.

## Outstanding work for Ahmed (not Claude)

1. Get an Anthropic API key, add ~$50 credit.
2. Push to GitHub, import to Vercel, set `ANTHROPIC_API_KEY` env var.
3. Test live demo end-to-end on the Vercel URL.
4. Edit `application/yc_application_draft.md` to his voice.
5. Record 60-second founder video (script in `application/founder_video_script.md`).
6. Record 90-second demo video (script in `application/demo_video_script.md`).
7. Submit before May 4, 8pm PT.
