import Link from "next/link";
import { ArrowRight, Library, GitBranch, Sparkles, Plus } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NORTHWIND_SKILLS } from "@/lib/seed/skills";

export const metadata = {
  title: "Registry — Skillforge skill marketplace",
  description:
    "Open-source SKILL.md files contributed by the community. Browse, fork, and use.",
};

const TOPIC_COLORS: Record<string, string> = {
  refunds: "border-red-500/30 bg-red-500/10 text-red-300",
  pricing: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  incidents: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "customer-success":
    "border-purple-500/30 bg-purple-500/10 text-purple-300",
  procurement: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  hiring: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  comms: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
};

export default function RegistryPage() {
  // The registry seeds with the Northwind-derived skills (clearly labeled).
  // Once the open-source repo is live, this page will read from a /skills/
  // directory in the repo via PR contributions.
  const skills = NORTHWIND_SKILLS;
  const byTopic = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.topic] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-20 flex-1 w-full">
        <Badge
          variant="default"
          className="mb-3 inline-flex items-center gap-1.5"
        >
          <Library className="size-3" /> registry
        </Badge>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-3 leading-tight">
          Open skills, shared across companies.
        </h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 max-w-3xl">
          Most companies are solving the same problems — refunds, incidents,
          pricing exceptions, comms protocols. The patterns repeat. The
          registry is where reusable skill scaffolds live, contributed by
          the community, ready to fork and customize.
        </p>
        <div className="flex flex-wrap gap-3 mb-12">
          <Button asChild>
            <a
              href="https://github.com/AhmedTariqCS/skillforge/tree/main/registry"
              target="_blank"
              rel="noreferrer"
            >
              <GitBranch className="size-4" /> Contribute on GitHub
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/forge">
              <Sparkles className="size-4" /> Forge your own
            </Link>
          </Button>
        </div>

        <div className="space-y-12">
          {Object.entries(byTopic)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([topic, list]) => (
              <section key={topic}>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${TOPIC_COLORS[topic] ?? "border-border bg-card text-foreground"}`}
                  >
                    {topic}
                  </span>
                  <h2 className="text-base font-semibold tracking-tight">
                    {list.length} skill{list.length === 1 ? "" : "s"}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map((s) => (
                    <Link
                      key={s.name}
                      href={`/skills/${s.name}`}
                      className="rounded-lg border border-border bg-card hover:border-primary/40 p-4 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="font-mono text-sm font-semibold text-foreground break-words">
                          {s.name}
                        </p>
                        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {s.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-3 font-mono">
                        derived from Northwind dataset
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>

        <div className="mt-16 rounded-xl border border-primary/30 bg-primary/5 p-8">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Plus className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight mb-2">
                Contribute a skill
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                Have a SKILL.md you wrote (or generated with the CLI) that
                others would benefit from? Open a PR. Skills in the registry
                are MIT-licensed scaffolds — others can fork and customize.
                The shared patterns become better than any one company&apos;s
                isolated knowledge.
              </p>
              <Button asChild variant="outline">
                <a
                  href="https://github.com/AhmedTariqCS/skillforge/tree/main/registry"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open contribution guide <ArrowRight className="size-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
