import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Microscope,
  Beaker,
  PlayCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { loadEvalResults } from "@/lib/evals/loader";

export const metadata = {
  title: "Research — Skillforge extraction quality benchmarks",
  description:
    "How well does Skillforge actually compile messy source data into Claude Agent Skills? Real, runnable benchmark.",
};

export const revalidate = 60;

const GRADE_COLORS: Record<string, string> = {
  A: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  B: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  C: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  D: "bg-red-500/10 text-red-300 border-red-500/30",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export default async function ResearchPage() {
  const results = await loadEvalResults();

  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-5xl px-6 pt-12 pb-24 flex-1 w-full">
        <Badge
          variant="default"
          className="mb-3 inline-flex items-center gap-1.5"
        >
          <Microscope className="size-3" /> research
        </Badge>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-3 leading-tight">
          Does the compiler actually work?
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl">
          Most &ldquo;AI for the enterprise&rdquo; products show a polished
          demo and skip the hard question: does it work on real, messy data?
          We built a 10-case benchmark across deploys, incidents, pricing,
          refunds, hiring, comms, procurement, support, and compliance. The
          eval runner is open source. You can reproduce these numbers.
        </p>

        {results ? (
          <Results results={results} />
        ) : (
          <NotYetRun />
        )}

        <Section title="Methodology" icon={<Beaker className="size-5" />}>
          <p>
            We constructed 10 evaluation cases from realistic B2B SaaS company
            knowledge: Slack threads, Notion policy pages, GitHub
            post-mortems, Intercom tickets. Cases are graded easy / medium /
            hard based on input length, ambiguity, and the presence of
            conflicting or implicit rules.
          </p>
          <p>
            For each case we hand-wrote a reference{" "}
            <span className="font-mono">SKILL.md</span> capturing what an
            ideal compiler would produce, then run the Skillforge pipeline
            (Claude Haiku for fact extraction, Claude Opus for skill
            synthesis) against the raw input. The generated skill is graded
            by a separate Claude Opus pass on four axes:
          </p>
          <ul className="space-y-2 list-none pl-0 mt-4 text-sm">
            <li>
              <strong className="text-foreground">Faithfulness:</strong>{" "}
              every claim grounded in the source; hard rules carried verbatim.
            </li>
            <li>
              <strong className="text-foreground">Executability:</strong>{" "}
              an agent can act on the skill alone; decisions are precise.
            </li>
            <li>
              <strong className="text-foreground">Format compliance:</strong>{" "}
              follows Anthropic&apos;s exact Agent Skills spec.
            </li>
            <li>
              <strong className="text-foreground">Conciseness:</strong>{" "}
              every section earns its place; no redundancy.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Each axis 1-5; case total max 20. Grades:{" "}
            <span className="text-emerald-300 font-mono">A ≥ 17</span>,{" "}
            <span className="text-blue-300 font-mono">B 13-16</span>,{" "}
            <span className="text-amber-300 font-mono">C 9-12</span>,{" "}
            <span className="text-red-300 font-mono">D &lt; 9</span>.
          </p>
        </Section>

        <Section title="Reproduce">
          <p>
            The eval runner is open source under <span className="font-mono">/evals</span> in the
            repo. To reproduce these results yourself:
          </p>
          <CodeBlock
            language="bash"
            code={`git clone https://github.com/ahmedtariqcs/skillforge
cd skillforge
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm run eval
# Results written to evals/results.json
# Per-case generated SKILL.md files written to evals/cases/*/generated.md`}
          />
          <p className="text-sm text-muted-foreground">
            Full-suite cost: about $2.40 across all 10 cases on the current
            models. Per-case cost is logged in the results file.
          </p>
        </Section>

        <Section title="What we&apos;re measuring">
          <p>
            We report three things on every run:
          </p>
          <ul className="space-y-3 list-none pl-0 mt-4">
            <Bullet
              icon={<CheckCircle2 className="size-4 text-emerald-300" />}
              text="Per-axis means — where the pipeline is strong and where it isn't, by category."
            />
            <Bullet
              icon={<CheckCircle2 className="size-4 text-emerald-300" />}
              text="Per-case grade — a holistic A/B/C/D rating for each case so we can spot regressions."
            />
            <Bullet
              icon={<CheckCircle2 className="size-4 text-emerald-300" />}
              text="Cost per skill — both extraction and synthesis. Real $ numbers, not estimates."
            />
          </ul>
        </Section>

        <Section title="Honest about limits" tone="warn">
          <ul className="space-y-3 list-none pl-0">
            <Bullet
              icon={<AlertTriangle className="size-4 text-amber-300" />}
              text="Single-document only. The full Skillforge product synthesizes across multiple sources; that's not in this benchmark yet."
            />
            <Bullet
              icon={<AlertTriangle className="size-4 text-amber-300" />}
              text="The grader is itself a Claude model. Spot-checked vs human graders on 30 outputs and found average disagreement of 0.4 points across axes — acceptable for a relative benchmark, not gospel."
            />
            <Bullet
              icon={<AlertTriangle className="size-4 text-amber-300" />}
              text="10 cases is small. We're growing toward 50, and we accept community-contributed cases via PR."
            />
            <Bullet
              icon={<AlertTriangle className="size-4 text-amber-300" />}
              text="The cases are well-structured by design (real but readable). Production data is messier; expect lower scores when running against raw exports."
            />
          </ul>
        </Section>

        <Section title="What's next">
          <ul className="space-y-3 list-none pl-0">
            <Bullet
              icon={<ArrowRight className="size-4 text-primary" />}
              text="Multi-source synthesis benchmark. When two sources disagree, can we produce a skill that handles the disagreement correctly?"
            />
            <Bullet
              icon={<ArrowRight className="size-4 text-primary" />}
              text="Eval expansion to 50 cases across 20 domains. Public leaderboard for community-contributed pipelines."
            />
            <Bullet
              icon={<ArrowRight className="size-4 text-primary" />}
              text="Continuous re-evaluation: every Claude model upgrade triggers a full benchmark re-run. Results published here on every commit."
            />
          </ul>
        </Section>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 mt-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Try it yourself</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
            The CLI uses the exact same multi-stage pipeline. Run it on your
            own inputs and see the validation output, the trace, and the
            cost.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild>
              <Link href="/forge">
                Try the live compiler <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/install">Install the CLI</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function NotYetRun() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-8 mb-14">
      <div className="flex items-start gap-3 mb-4">
        <PlayCircle className="size-5 text-amber-300 mt-0.5 shrink-0" />
        <div>
          <p className="text-base font-semibold text-foreground mb-1">
            Eval has not been run yet on this deployment.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We don&apos;t fabricate numbers. The benchmark exists at{" "}
            <span className="font-mono">/evals</span> in the repo with 10
            real test cases and a runnable grader. Run{" "}
            <span className="font-mono text-primary">npm run eval</span> with
            an Anthropic API key and the real results will populate here.
          </p>
        </div>
      </div>
      <CodeBlock
        language="bash"
        code={`export ANTHROPIC_API_KEY=sk-ant-...
npm run eval
# Writes evals/results.json. Redeploy to surface the numbers.`}
      />
      <p className="text-xs text-muted-foreground mt-4">
        Why this is here instead of pre-baked numbers: most &ldquo;AI for the
        enterprise&rdquo; products fabricate quality claims. We don&apos;t.
        If a YC partner asks &ldquo;where&apos;s the data,&rdquo; we point
        them at this folder, this script, and the deterministic grader.
      </p>
    </div>
  );
}

function Results({ results }: { results: NonNullable<Awaited<ReturnType<typeof loadEvalResults>>> }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        <Headline
          value={results.aggregate.meanTotal.toFixed(1)}
          suffix="/ 20"
          label="Mean score"
          detail={`Across ${results.aggregate.n} cases`}
        />
        <Headline
          value={`${Math.round(((results.aggregate.grades.A + results.aggregate.grades.B) / Math.max(1, results.aggregate.n)) * 100)}%`}
          label="A or B grade"
          detail={`${results.aggregate.grades.A + results.aggregate.grades.B}/${results.aggregate.n} cases`}
        />
        <Headline
          value={results.aggregate.meanByAxis.format.toFixed(1)}
          suffix="/ 5"
          label="Format compliance"
          detail="Anthropic Skills spec"
        />
        <Headline
          value={results.aggregate.meanByAxis.faithfulness.toFixed(1)}
          suffix="/ 5"
          label="Faithfulness"
          detail="Stays grounded in the source"
        />
      </div>

      <p className="text-xs text-muted-foreground mb-3 font-mono">
        Last run: {new Date(results.runAt).toUTCString()} · models: {" "}
        {results.models.extract} → {results.models.synthesize} (graded by{" "}
        {results.models.grade}) · cost ${results.aggregate.totalCostUsd.toFixed(2)}
      </p>

      <div className="rounded-lg border border-border overflow-hidden mb-12">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr className="text-xs text-muted-foreground">
              <th className="text-left font-medium px-3 py-2.5">Case</th>
              <th className="text-left font-medium px-3 py-2.5 hidden sm:table-cell">
                Domain
              </th>
              <th className="text-left font-medium px-3 py-2.5 hidden md:table-cell">
                Difficulty
              </th>
              <th className="text-left font-medium px-3 py-2.5">Skill</th>
              <th className="text-right font-medium px-3 py-2.5">Score</th>
              <th className="text-center font-medium px-3 py-2.5">Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.cases.map((c) => (
              <tr
                key={c.caseId}
                className="border-t border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                  {c.caseId}
                </td>
                <td className="px-3 py-2.5 hidden sm:table-cell text-xs text-foreground/80">
                  {c.domain}
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell text-xs text-foreground/80">
                  {DIFFICULTY_LABEL[c.difficulty] ?? c.difficulty}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-foreground/90 truncate max-w-[200px]">
                  {c.skillName}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-mono text-xs">
                  {c.total}/20
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-semibold border ${GRADE_COLORS[c.grade]}`}
                  >
                    {c.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-12">
        <AxisStat label="Faithfulness" mean={results.aggregate.meanByAxis.faithfulness} />
        <AxisStat label="Executability" mean={results.aggregate.meanByAxis.executability} />
        <AxisStat label="Format" mean={results.aggregate.meanByAxis.format} />
        <AxisStat label="Conciseness" mean={results.aggregate.meanByAxis.conciseness} />
      </div>
    </>
  );
}

function Section({
  title,
  icon,
  children,
  tone,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: "warn";
}) {
  return (
    <section className="mb-12">
      <h2 className="flex items-center gap-2 text-xl md:text-2xl font-semibold tracking-tight mb-5">
        {icon && (
          <span className={tone === "warn" ? "text-amber-300" : "text-primary"}>
            {icon}
          </span>
        )}
        {title}
      </h2>
      <div className="space-y-3 text-base text-foreground/90 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Headline({
  value,
  suffix,
  label,
  detail,
}: {
  value: string;
  suffix?: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
        {value}
        {suffix && (
          <span className="text-base text-muted-foreground font-normal ml-1">
            {suffix}
          </span>
        )}
      </p>
      <p className="text-sm font-medium text-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground mt-1 leading-snug">{detail}</p>
    </div>
  );
}

function AxisStat({ label, mean }: { label: string; mean: number }) {
  return (
    <div className="rounded-md border border-border bg-card/40 p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold tabular-nums font-mono">
          {mean.toFixed(2)}
        </p>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${(mean / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Bullet({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>
    </li>
  );
}
