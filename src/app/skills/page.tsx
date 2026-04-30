import Link from "next/link";
import { BookOpen, Clock, Layers } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { NORTHWIND_SKILLS } from "@/lib/seed/skills";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = {
  title: "Skills — Skillforge",
  description:
    "The executable skills generated from Northwind's company knowledge.",
};

const TOPIC_COLORS: Record<string, string> = {
  refunds: "bg-red-500/10 text-red-300 border-red-500/30",
  pricing: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  incidents: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  "customer-success": "bg-purple-500/10 text-purple-300 border-purple-500/30",
  procurement: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  hiring: "bg-pink-500/10 text-pink-300 border-pink-500/30",
  comms: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
};

export default function SkillsPage() {
  const sorted = [...NORTHWIND_SKILLS].sort((a, b) =>
    b.lastUpdatedAt.localeCompare(a.lastUpdatedAt)
  );

  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-16 flex-1 w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">{NORTHWIND_SKILLS.length} skills</Badge>
            <span className="text-xs text-muted-foreground font-mono">
              generated from 19 docs · 18 facts
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Skill library
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            Each skill is a SKILL.md file in Claude&apos;s Agent Skills format.
            They&apos;re what the agent actually loads at query time. Every fact
            is traceable back to the source document it came from.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((skill) => (
            <Link
              key={skill.name}
              href={`/skills/${skill.name}`}
              className="group rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${
                    TOPIC_COLORS[skill.topic] ??
                    "bg-secondary text-secondary-foreground border-border"
                  }`}
                >
                  <Layers className="size-3" />
                  {skill.topic}
                </div>
                <BookOpen className="size-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-foreground mb-1.5 break-words">
                  {skill.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {skill.description}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-2 border-t border-border/60">
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatRelativeTime(skill.lastUpdatedAt)}
                </span>
                <span>·</span>
                <span>
                  {skill.factIds.length}{" "}
                  {skill.factIds.length === 1 ? "fact" : "facts"}
                </span>
                <span>·</span>
                <span>{Math.round(skill.body.length / 100) / 10}KB</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-card/50 p-6">
          <h2 className="text-base font-semibold mb-3">
            What&apos;s in a SKILL.md?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            YAML frontmatter (<span className="font-mono text-foreground">name</span>{" "}
            and{" "}
            <span className="font-mono text-foreground">description</span>) +
            markdown body with policies, decision trees, examples, and hard
            rules. Each skill is under Anthropic&apos;s 500-line guidance for
            optimal agent performance, with progressive disclosure (extra
            reference files load only when needed).
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
