import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Clock, Layers } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SourceIcon } from "@/components/source-icon";
import { SkillView } from "@/components/skill-view";
import { getSkillByName, NORTHWIND_SKILLS } from "@/lib/seed/skills";
import { getFactsByIds } from "@/lib/seed/facts";
import { NORTHWIND_DOCS } from "@/lib/seed/northwind";
import { formatRelativeTime } from "@/lib/utils";

export async function generateStaticParams() {
  return NORTHWIND_SKILLS.map((s) => ({ name: s.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const skill = getSkillByName(name);
  if (!skill) return {};
  return {
    title: `${skill.name} — Skillforge skill`,
    description: skill.description,
  };
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const skill = getSkillByName(name);
  if (!skill) notFound();

  const facts = getFactsByIds(skill.factIds);
  const sourceDocIds = new Set<string>();
  facts.forEach((f) => f.evidence.forEach((e) => sourceDocIds.add(e.docId)));
  const sourceDocs = NORTHWIND_DOCS.filter((d) => sourceDocIds.has(d.id));

  // Other skills in the same topic
  const related = NORTHWIND_SKILLS.filter(
    (s) => s.topic === skill.topic && s.name !== skill.name
  ).slice(0, 3);

  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-7xl px-6 pt-8 pb-16 flex-1 w-full">
        <Link
          href="/skills"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" /> All skills
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="default">
                <Layers className="size-3 mr-1" /> {skill.topic}
              </Badge>
              <Badge variant="muted">
                <Clock className="size-3 mr-1" />
                updated {formatRelativeTime(skill.lastUpdatedAt)}
              </Badge>
              <Badge variant="muted">{skill.factIds.length} facts</Badge>
              <Badge variant="muted">
                {sourceDocs.length} source{sourceDocs.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-mono font-semibold tracking-tight mb-3 break-words">
              {skill.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {skill.description}
            </p>

            <SkillView skill={skill} />

            {related.length > 0 && (
              <div className="mt-8 rounded-lg border border-border bg-card/40 p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                  Related skills in {skill.topic}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map((r) => (
                    <Link
                      key={r.name}
                      href={`/skills/${r.name}`}
                      className="rounded-md border border-border bg-card p-3 hover:border-primary/40 transition-colors"
                    >
                      <p className="text-xs font-mono font-medium text-foreground mb-1 truncate">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                        {r.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Backing facts
              </p>
              <div className="space-y-3">
                {facts.map((fact) => (
                  <div key={fact.id} className="text-sm">
                    <Badge variant="muted" className="text-[10px] mb-1.5">
                      {fact.type}
                    </Badge>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {fact.statement}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {fact.evidence.length} sources ·{" "}
                      {Math.round(fact.evidence[0]?.confidence * 100)}% confidence
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Source documents
              </p>
              <div className="space-y-3">
                {sourceDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/sources/${doc.id}`}
                    className="flex items-start gap-2.5 group"
                  >
                    <SourceIcon type={doc.source} size={20} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {doc.author} · {formatRelativeTime(doc.updatedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/demo">
                Try this skill in the demo <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
