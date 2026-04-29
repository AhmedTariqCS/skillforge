import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DemoClient } from "@/components/demo-client";
import { DEMO_SCENARIOS, NORTHWIND_INFO } from "@/lib/seed/northwind";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata = {
  title: "Live demo — Skillforge",
  description:
    "Run the same prompt against Claude with and without Northwind's company brain. See what your knowledge actually unlocks.",
};

export default function DemoPage() {
  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-16 flex-1 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">live</Badge>
            <span className="text-xs text-muted-foreground font-mono">
              demo dataset: {NORTHWIND_INFO.name}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            See the brain work
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            We&apos;ve loaded {NORTHWIND_INFO.name} — a fictional B2B SaaS — into
            Skillforge. Pick a scenario or write your own. Both columns send the
            same prompt to Claude. Only the right column has access to
            Northwind&apos;s skills.{" "}
            <Link
              href="/sources"
              className="text-primary hover:underline whitespace-nowrap"
            >
              See the source data →
            </Link>
          </p>
        </div>

        <DemoClient scenarios={DEMO_SCENARIOS} />

        <div className="mt-12 rounded-lg border border-border bg-card/50 p-6">
          <h2 className="text-lg font-semibold mb-3">How this works</h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
            <li>
              When Northwind connected their Slack, Notion, GitHub, and
              Intercom, Skillforge ingested 19 documents (real-feeling content
              you can browse on the{" "}
              <Link href="/sources" className="text-primary hover:underline">
                sources
              </Link>{" "}
              page).
            </li>
            <li>
              Our extraction pipeline pulled out 18 facts with provenance —
              who said what, where, and when.
            </li>
            <li>
              Those facts were synthesized into{" "}
              <Link href="/skills" className="text-primary hover:underline">
                7 executable skills
              </Link>{" "}
              in Claude&apos;s Agent Skills format. Each skill is a
              self-contained playbook with policies, examples, and hard rules.
            </li>
            <li>
              At query time, the brain picks relevant skills and loads them
              into the agent&apos;s context. The agent now has Northwind&apos;s
              institutional memory.
            </li>
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}
