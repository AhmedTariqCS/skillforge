# skillforge

> Compile scattered company knowledge — Slack threads, Notion pages, post-mortems — into Claude Agent Skills (`SKILL.md` files).

The company brain for AI agents, as a CLI.

```
$ npx @skforge/cli extract slack-thread.txt
✦ Extracting facts…
  · [constraint] Deploy freezes apply to prod, not staging. (95%)
  · [constraint] Feature flag flips on net-new features count as deploys. (92%)
  · [procedure] Hotfixes route through Priya or Ravi during freezes. (90%)
✦ Compiling SKILL.md…
✦ Done · 5 facts → handling-deploy-freeze in 8742ms

---
name: handling-deploy-freeze
description: Decides whether a change can ship during an active deploy freeze...
---

# Handling Deploy Freeze
...
```

## Why this exists

AI agents are smart. Your company isn't documented. The result: agents stay generic and humans stay copy-pasting.

Skillforge takes a Slack thread, a Notion page, a post-mortem — anything with company-specific knowledge — and compiles it into a `SKILL.md` file in [Claude's Agent Skills format](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview). Drop the output into `~/.claude/skills/` and Claude Code uses it automatically. Or upload it via the Skills API.

## Install

Run instantly with `npx`:

```bash
npx @skforge/cli extract <file>
```

Or install globally:

```bash
npm install -g @skforge/cli
skforge extract <file>
```

You'll need an `ANTHROPIC_API_KEY`:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com). A typical extraction costs ~$0.03.

## Usage

### Single file → SKILL.md to stdout

```bash
skforge extract path/to/notion-doc.md
```

### To a Claude Code skills folder

```bash
skforge extract slack-thread.txt -d ~/.claude/skills
# Creates ~/.claude/skills/<skill-name>/SKILL.md
```

### Batch a directory

```bash
skforge batch ./company-docs -o ./skills --ext .md,.txt
```

Walks the input directory, extracts a skill from each file, writes them all to `./skills/<skill-name>/SKILL.md`.

### Hint the extractor

```bash
skforge extract incident.md --hint "A SEV2 incident post-mortem"
```

Hints help the model orient. They're optional — the extractor figures it out without one most of the time.

### Just the facts

```bash
skforge extract policy.md --facts-only
# Outputs JSON: { topic, facts: [{ type, statement, confidence, ... }] }
```

### Pipe from stdin

```bash
cat slack-thread.txt | skforge extract -
```

### Inspect an input before paying for it

```bash
skforge describe my-doc.md
# Prints char/word/line counts and an estimated cost
```

## Commands

| Command | Description |
|---------|-------------|
| `extract <file>` | Extract a single SKILL.md (or `-` for stdin). |
| `batch <dir>` | Extract every supported file in a directory. |
| `describe <file>` | Show input stats and estimated cost. |

## Options

```
-o, --output <path>        Write to a file instead of stdout
-d, --output-dir <dir>     Write to <dir>/<skill-name>/SKILL.md
--hint <text>              Short context hint
--api-key <key>            Override ANTHROPIC_API_KEY
--facts-only               Output extracted facts as JSON
--extract-model <model>    Override extraction model
--synthesis-model <model>  Override synthesis model
--quiet                    Suppress progress logging
```

## How it works

1. **Extract.** Claude Haiku reads the input and produces structured facts: policies, procedures, decisions, constraints (hard rules), people, systems. Each fact is typed and confidence-scored.
2. **Synthesize.** Claude Opus takes the facts and writes a `SKILL.md` file following [Anthropic's Agent Skills best practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) — gerund-form name, third-person description, ≤500-line body, hard rules called out, examples included.
3. **Done.** The output is a real Claude Agent Skill. Drop it in `~/.claude/skills/<skill-name>/SKILL.md` and Claude Code picks it up.

## Cost

A typical single-file extraction uses ~1.5K tokens of Haiku input, ~200 tokens of Haiku output, ~1K tokens of Opus input, and ~1.5K tokens of Opus output. **About $0.12 per skill.** Run `skforge describe` for a more precise estimate before spending.

## Programmatic API

```typescript
import { forge } from "@skforge/cli";

const result = await forge(text, {
  apiKey: process.env.ANTHROPIC_API_KEY,
  hint: "A Slack thread about pricing exceptions",
  onProgress: (event) => {
    if (event.type === "fact") {
      console.log(`extracted: ${event.fact.statement}`);
    }
  },
});

console.log(result.skill.name);
console.log(result.skill.body);
```

## What's the hosted product?

This CLI is the open-source compiler. The hosted product at [skforge.dev](https://skforge.dev) connects directly to Slack, Notion, Drive, GitHub, Intercom, and Linear; runs the compiler continuously across all your sources; tracks supersession and conflicts across versions; and provides review workflows for cross-functional ownership. Same primitive, hosted plumbing.

## License

MIT. Built for Y Combinator Summer 2026 against Tom Blomfield's "Company Brain" RFS.

## Links

- Hosted demo: [skforge.dev/demo](https://skforge.dev/demo)
- Live extraction: [skforge.dev/forge](https://skforge.dev/forge)
- About: [skforge.dev/about](https://skforge.dev/about)
- Issues / PRs: GitHub repo
