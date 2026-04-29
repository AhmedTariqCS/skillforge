import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ForgeClient } from "@/components/forge-client";
import { Badge } from "@/components/ui/badge";
import { FORGE_SAMPLES } from "@/lib/forge-samples";
import { Hammer } from "lucide-react";

export const metadata = {
  title: "Forge — live skill compiler — Skillforge",
  description:
    "Paste a Slack thread, Notion doc, or post-mortem and watch Skillforge compile it into a Claude Agent Skill in real time.",
};

export default function ForgePage() {
  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-16 flex-1 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="inline-flex items-center gap-1.5">
              <Hammer className="size-3" />
              live compiler
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              real Claude calls · streaming
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Forge
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            Paste raw company knowledge — a Slack thread, a Notion page, a
            post-mortem. Watch Skillforge extract structured facts and compile
            them into a SKILL.md file your AI agents can run. This is the
            actual pipeline running on your input, not a demo recording.
          </p>
        </div>

        <ForgeClient samples={FORGE_SAMPLES} />

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Step
            num={1}
            title="Extract facts"
            detail="Claude Haiku reads the input and extracts structured facts: policies, procedures, decisions, hard rules, ownership. Each fact is typed and confidence-scored."
          />
          <Step
            num={2}
            title="Synthesize the skill"
            detail="Claude Opus takes the facts and compiles them into a SKILL.md file following Anthropic's Agent Skills best practices. Streamed token by token."
          />
          <Step
            num={3}
            title="Drop in & run"
            detail="The output is a real SKILL.md. Copy it to ~/.claude/skills/ and Claude Code picks it up automatically — or upload via the Skills API."
          />
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card/40 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Production pipeline
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In production, Skillforge runs this pipeline continuously across
            all your connected sources — Slack, Notion, Drive, GitHub,
            Intercom, Linear. We monitor source changes, re-extract on update,
            track supersession across versions, and republish skills with full
            provenance trails. This page demonstrates the core compiler on a
            single piece of input.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Step({
  num,
  title,
  detail,
}: {
  num: number;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="size-6 rounded-md bg-primary/10 text-primary text-xs font-mono flex items-center justify-center">
          {num}
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
    </div>
  );
}
