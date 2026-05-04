# Skillforge

The company brain for AI agents. Built for Y Combinator Summer 2026 against Tom Blomfield's "Company Brain" RFS.

**Live demo:** https://skforge.dev/demo

## What it does

Skillforge connects to a company's Slack, Notion, Drive, GitHub, Intercom, and Linear; extracts structured facts with provenance; and synthesizes them into executable skills in Claude's [Agent Skills format](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview).

The output is a folder of versioned `SKILL.md` files an AI agent can pick up and run — turning generic agents into ones that know your refund matrix, your discount ladder, your incident runbook.

## What's in this repo

```
src/
├── app/
│   ├── page.tsx          # landing
│   ├── demo/             # live side-by-side agent demo
│   ├── skills/           # skill library + detail pages
│   ├── sources/          # connected sources + doc detail pages
│   ├── manifesto/        # vision page
│   └── api/              # streaming agent + skills + sources endpoints
├── components/           # UI primitives + demo client
└── lib/
    ├── agent.ts          # with-brain vs without-brain runner
    ├── claude.ts         # Anthropic SDK wrapper
    ├── db/               # Drizzle schema + Neon client
    └── seed/             # Northwind demo dataset (19 docs, 18 facts, 7 skills)
```

## Run locally

```bash
npm install
cp .env.example .env.local
# Set ANTHROPIC_API_KEY in .env.local
npm run dev
```

Open http://localhost:3000.

## Deploy

See `../application/deployment_guide.md` for the step-by-step.

Short version: push to GitHub, import to Vercel, set `ANTHROPIC_API_KEY` env var, deploy.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Anthropic SDK (Claude Sonnet 4.6 for the agent, Haiku 4.5 for triage)
- Drizzle ORM + Neon Postgres + pgvector (optional — waitlist + future live extraction)
- Vercel (frontend + serverless)

## License

All rights reserved (for now). The Northwind demo dataset is fictional and licensed as CC-BY for educational use.
