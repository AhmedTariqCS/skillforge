import Link from "next/link";
import {
  ArrowRight,
  MessagesSquare,
  FileText,
  GitBranch,
  Database,
  Brain,
  Sparkles,
  Zap,
  ShieldCheck,
  Code2,
  Hammer,
  Eye,
  Layers,
  Clock,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaitlistForm } from "@/components/waitlist-form";
import { Markdown } from "@/components/markdown";
import { HeroVisual } from "@/components/hero-visual";
import { StatsBanner } from "@/components/stats-banner";
import { NORTHWIND_SKILLS } from "@/lib/seed/skills";

const SAMPLE_SKILL_PREVIEW = NORTHWIND_SKILLS.find(
  (s) => s.name === "responding-to-payment-incidents"
)!;

export default function LandingPage() {
  return (
    <>
      <Header variant="marketing" />
      <main className="flex-1 w-full">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
          <div className="absolute inset-0 bg-radial-fade" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-12 text-center">
            <Badge
              variant="default"
              className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 animate-fade-up"
            >
              <Sparkles className="size-3" />
              Y Combinator Summer 2026 — applying for Tom Blomfield&apos;s RFS
            </Badge>
            <h1
              className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6 animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <span className="text-gradient">Your agents got smart.</span>
              <br />
              <span className="text-gradient-primary">
                Your company didn&apos;t.
              </span>
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              Skillforge turns the knowledge buried in your Slack, Notion,
              GitHub, and Intercom into{" "}
              <span className="text-foreground">executable skills</span>{" "}
              your AI agents can actually run. The compiler from
              company history to{" "}
              <span className="font-mono text-foreground">SKILL.md</span>.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-12 animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <Button size="xl" asChild className="pulse-glow">
                <Link href="/demo">
                  Run the live demo <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/forge" className="inline-flex items-center gap-2">
                  <Hammer className="size-4" /> Watch the compiler
                </Link>
              </Button>
            </div>

            <div
              className="animate-fade-up"
              style={{ animationDelay: "400ms" }}
            >
              <HeroVisual />
            </div>

            <p
              className="mt-8 text-xs text-muted-foreground animate-fade-up"
              style={{ animationDelay: "500ms" }}
            >
              No signup required for the demo. Real Claude API. Real streaming.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <StatsBanner />
          </div>
        </section>

        {/* THE PROBLEM */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary mb-3 font-medium">
                  The problem
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5 leading-tight">
                  AI agents have learned everything except your company.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Drop Claude or GPT into a real workflow and the wall arrives
                  fast.{" "}
                  <strong className="text-foreground">
                    The model is brilliant. It has no idea how your company
                    works.
                  </strong>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your refund policy lives in a Notion doc. The exception that
                  killed the last deal lives in a Slack thread. The reason you
                  don&apos;t restart payment pods lives in a post-mortem
                  nobody re-reads. So agents stay generic and humans stay
                  copy-pasting.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <ProblemRow
                  icon={<MessagesSquare className="size-4" />}
                  bg="bg-[#4A154B]/15 text-[#ECB22E]"
                  title="2 years of Slack"
                  detail="The decision matrix nobody wrote down."
                />
                <ProblemRow
                  icon={<FileText className="size-4" />}
                  bg="bg-zinc-300/10 text-zinc-200"
                  title="100s of Notion pages"
                  detail="Half are out of date. Half contradict the others."
                />
                <ProblemRow
                  icon={<GitBranch className="size-4" />}
                  bg="bg-zinc-700/30 text-zinc-100"
                  title="GitHub post-mortems"
                  detail="The hard rules learned the hard way."
                />
                <ProblemRow
                  icon={<Database className="size-4" />}
                  bg="bg-blue-500/15 text-blue-300"
                  title="One engineer's brain"
                  detail="The dependency that walks out the door at 5pm."
                />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="border-t border-border/60 bg-gradient-to-b from-transparent to-primary/[0.02]"
        >
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-wider text-primary mb-3 font-medium">
                How it works
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Knowledge in. Executable skills out.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three steps from a mess of company history to skills any agent
                can run.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                num={1}
                title="Connect what you already have"
                icon={<Database className="size-5" />}
                detail="Slack, Notion, Google Drive, GitHub, Intercom, Linear. Read-only, OAuth-scoped, audited. Your IT will say yes."
              />
              <StepCard
                num={2}
                title="Extract structured facts"
                icon={<Brain className="size-5" />}
                detail="Our pipeline pulls out policies, decisions, hard rules, and tribal knowledge — with provenance. Every fact traces back to its source."
              />
              <StepCard
                num={3}
                title="Generate executable skills"
                icon={<Code2 className="size-5" />}
                detail="Synthesize into Claude Agent Skills format. Each skill is a runnable playbook your agents pick up automatically — no prompt engineering."
              />
            </div>
          </div>
        </section>

        {/* FORGE TEASER */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.05] via-primary/[0.02] to-transparent p-10 md:p-14 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
              <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
                <div>
                  <Badge
                    variant="default"
                    className="mb-4 inline-flex items-center gap-1.5"
                  >
                    <Hammer className="size-3" /> live compiler
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 leading-tight">
                    Or watch the compiler work in front of you.
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Paste a Slack thread, a Notion page, a post-mortem.
                    Skillforge extracts structured facts and compiles a
                    SKILL.md file in real time. Real Claude calls. No demo
                    recordings.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" asChild>
                      <Link href="/forge">
                        Try the forge <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/demo">Run the agent demo</Link>
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card overflow-hidden font-mono text-[10px] leading-relaxed">
                  <div className="bg-muted/30 border-b border-border px-3 py-1.5 text-muted-foreground">
                    forge / output
                  </div>
                  <div className="p-3 space-y-1.5">
                    <p className="text-emerald-400">→ Extracting facts...</p>
                    <p className="text-foreground/80">
                      ✓ <span className="text-amber-300">[constraint]</span>{" "}
                      Deploy freezes apply to prod, not staging.
                    </p>
                    <p className="text-foreground/80">
                      ✓ <span className="text-amber-300">[constraint]</span>{" "}
                      Feature flag flips on net-new features count as deploys.
                    </p>
                    <p className="text-foreground/80">
                      ✓ <span className="text-purple-300">[procedure]</span>{" "}
                      Hotfixes route through Priya or Ravi.
                    </p>
                    <p className="text-emerald-400 mt-2">
                      → Compiling skill...
                    </p>
                    <p className="text-primary/80">
                      name: handling-deploy-freeze
                    </p>
                    <p className="text-foreground/70">
                      description: Decides whether a change can ship during
                      an active deploy freeze...
                    </p>
                    <p className="text-foreground/50">
                      <span className="inline-block w-1.5 h-2.5 bg-primary/70 align-middle animate-pulse" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CLI INSTALL */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
              <div>
                <Badge
                  variant="default"
                  className="mb-4 inline-flex items-center gap-1.5"
                >
                  <Code2 className="size-3" /> open source
                </Badge>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 leading-tight">
                  Or skip the SaaS. <br />Run it from your terminal.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The Skillforge compiler is open-source. One command from
                  any text to a SKILL.md file your agents can run.
                  MIT-licensed. Bring your own Anthropic API key.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href="/install">
                      Install the CLI <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/research">
                      See the benchmarks
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden font-mono text-xs">
                <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="size-2 rounded-full bg-zinc-700" />
                    <div className="size-2 rounded-full bg-zinc-700" />
                    <div className="size-2 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    terminal
                  </span>
                </div>
                <div className="p-4 leading-relaxed">
                  <p>
                    <span className="text-muted-foreground">$ </span>
                    <span className="text-foreground">
                      npx @ahmedtariq/skillforge extract slack-thread.txt
                    </span>
                  </p>
                  <p className="text-emerald-400 mt-2">
                    ✦ Extracting facts…
                  </p>
                  <p className="text-foreground/80">
                    {" "}· <span className="text-amber-300">[constraint]</span>{" "}
                    Deploy freezes apply to prod, not staging.
                  </p>
                  <p className="text-foreground/80">
                    {" "}· <span className="text-amber-300">[constraint]</span>{" "}
                    Feature flag flips count as deploys.
                  </p>
                  <p className="text-foreground/80">
                    {" "}· <span className="text-purple-300">[procedure]</span>{" "}
                    Hotfixes route through Priya or Ravi.
                  </p>
                  <p className="text-emerald-400 mt-2">
                    ✦ Compiling SKILL.md…
                  </p>
                  <p className="text-emerald-400 mt-1">
                    ✦ Done · 5 facts → handling-deploy-freezes in 8.7s
                  </p>
                  <p className="mt-3 text-primary/70">---</p>
                  <p className="text-primary/70">
                    name: handling-deploy-freezes
                  </p>
                  <p className="text-primary/70">description: Decides…</p>
                  <p className="text-foreground/40">
                    <span className="inline-block w-1.5 h-2.5 bg-primary/70 align-middle animate-pulse" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE ARTIFACT */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-primary mb-3 font-medium">
                  The artifact
                </p>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5 leading-tight">
                  Not another chatbot. A skill the agent runs.
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Each piece of company knowledge becomes a SKILL.md file in
                  Claude&apos;s Agent Skills format. Versioned. Reviewable.
                  Executable across Claude Code, the API, and claude.ai —
                  anywhere your agents run.
                </p>
                <ul className="space-y-3 mt-6">
                  <FeatureRow
                    icon={<ShieldCheck className="size-4" />}
                    title="Provenance, not vibes"
                    detail="Every fact traces to a Slack message, doc, or PR. Click through to verify."
                  />
                  <FeatureRow
                    icon={<Zap className="size-4" />}
                    title="Stays current"
                    detail="When the source changes, the brain re-extracts and republishes. No quarterly cleanups."
                  />
                  <FeatureRow
                    icon={<Brain className="size-4" />}
                    title="Hard rules survive"
                    detail="The 'we don't restart payments pods' rule outlives the engineer who learned it the hard way."
                  />
                </ul>
                <div className="mt-8 flex gap-3">
                  <Button asChild>
                    <Link href="/skills">
                      Browse generated skills <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/sources">See the source data</Link>
                  </Button>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5">
                <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="size-2.5 rounded-full bg-zinc-700" />
                    <div className="size-2.5 rounded-full bg-zinc-700" />
                    <div className="size-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <p className="text-xs font-mono text-muted-foreground ml-2">
                    skills/{SAMPLE_SKILL_PREVIEW.name}/SKILL.md
                  </p>
                </div>
                <div className="p-5 max-h-[480px] overflow-y-auto">
                  <pre className="text-[10px] font-mono text-primary/70 mb-3 leading-relaxed">
                    {`---
name: ${SAMPLE_SKILL_PREVIEW.name}
description: ${SAMPLE_SKILL_PREVIEW.description.slice(0, 120)}...
---`}
                  </pre>
                  <Markdown compact>
                    {SAMPLE_SKILL_PREVIEW.body
                      .split("\n")
                      .slice(0, 28)
                      .join("\n") + "\n\n…"}
                  </Markdown>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY WE'LL WIN */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-wider text-primary mb-3 font-medium">
                Why we&apos;ll win
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Skills are the right unit of value.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Glean and Notion AI sell answers. We sell skills. The
                difference is everything when the buyer is an agent, not a
                human.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <WhyCard
                icon={<Code2 className="size-5" />}
                title="Output is executable"
                detail="A SKILL.md file drops into ~/.claude/skills/. The agent picks it up automatically. Search products produce text; we produce primitives."
              />
              <WhyCard
                icon={<Eye className="size-5" />}
                title="Provenance is first-class"
                detail="Every fact is traceable to its source — the Slack message, the doc, the PR. Hallucinations aren't a model problem; they're a sourcing problem."
              />
              <WhyCard
                icon={<Clock className="size-5" />}
                title="Time is a primary axis"
                detail="We track when an announcement supersedes a doc, when v3 supersedes v2. Most knowledge tools treat all data as equal; we treat time as load-bearing."
              />
              <WhyCard
                icon={<Layers className="size-5" />}
                title="Skills are reviewable"
                detail="Markdown with frontmatter. Engineering can code-review. Compliance can sign off. Customer Success owns the refund skill. Adoption inside large companies becomes possible."
              />
            </div>
          </div>
        </section>

        {/* WHY NOW */}
        <section className="border-t border-border/60 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <p className="text-xs uppercase tracking-wider text-primary mb-3 font-medium text-center">
              Why now
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10 text-center max-w-3xl mx-auto leading-tight">
              The model isn&apos;t the bottleneck anymore. The knowledge is.
            </h2>
            <blockquote className="border-l-2 border-primary/60 pl-6 py-2 max-w-3xl mx-auto text-lg text-foreground/90 leading-relaxed italic">
              &ldquo;The biggest blocker to AI automation of companies is no
              longer the models — they just got so good so quickly. Now the
              blocker is the domain knowledge. We need a new primitive: a
              company brain. A system that pulls knowledge out of fragmented
              sources, structures it, keeps it current, and turns it into an
              executable skills file for AI.&rdquo;
              <footer className="mt-3 text-sm text-muted-foreground not-italic">
                — Tom Blomfield, YC Group Partner. Summer 2026 RFS.
              </footer>
            </blockquote>
            <p className="text-center text-sm text-muted-foreground mt-10 max-w-2xl mx-auto">
              He&apos;s right.{" "}
              <Link
                href="/about"
                className="text-primary hover:underline whitespace-nowrap"
              >
                We&apos;re building it →
              </Link>
            </p>

            <div className="mt-12 grid md:grid-cols-3 gap-3 max-w-3xl mx-auto">
              <Link
                href="/research"
                className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                  Research
                </p>
                <p className="text-sm font-medium">
                  17.9/20 mean score
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  10-case extraction benchmark with public rubric
                </p>
              </Link>
              <Link
                href="/install"
                className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                  CLI
                </p>
                <p className="text-sm font-medium">
                  Open source · MIT
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  One-command compiler · npm and npx ready
                </p>
              </Link>
              <Link
                href="/forge"
                className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                  Live forge
                </p>
                <p className="text-sm font-medium">
                  Real-time compilation
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                  Paste any text · watch it become a skill
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* WAITLIST */}
        <section id="waitlist" className="border-t border-border/60">
          <div className="mx-auto max-w-3xl px-6 py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Get early access
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              We&apos;re onboarding teams that have already shipped agents and
              hit the knowledge wall. Tell us about yours.
            </p>
            <WaitlistForm />
            <p className="text-xs text-muted-foreground mt-8">
              Want to talk to the founder?{" "}
              <a
                href="mailto:ahmedtariqcs@gmail.com"
                className="text-primary hover:underline"
              >
                ahmedtariqcs@gmail.com
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProblemRow({
  icon,
  bg,
  title,
  detail,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card/40 p-4">
      <div
        className={`size-9 shrink-0 rounded-md flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold mb-0.5">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

function StepCard({
  num,
  title,
  icon,
  detail,
}: {
  num: number;
  title: string;
  icon: React.ReactNode;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          STEP {num.toString().padStart(2, "0")}
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
    </div>
  );
}

function FeatureRow({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 text-primary shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

function WhyCard({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors h-full">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold tracking-tight mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
    </div>
  );
}
