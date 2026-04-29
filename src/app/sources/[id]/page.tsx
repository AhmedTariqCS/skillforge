import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink, Hash, User } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Markdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { SourceIcon, sourceLabel } from "@/components/source-icon";
import { NORTHWIND_DOCS } from "@/lib/seed/northwind";
import { NORTHWIND_FACTS } from "@/lib/seed/facts";
import { NORTHWIND_SKILLS } from "@/lib/seed/skills";
import { formatRelativeTime } from "@/lib/utils";

export async function generateStaticParams() {
  return NORTHWIND_DOCS.map((d) => ({ id: d.id }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = NORTHWIND_DOCS.find((d) => d.id === id);
  if (!doc) notFound();

  const factsFromDoc = NORTHWIND_FACTS.filter((f) =>
    f.evidence.some((e) => e.docId === doc.id)
  );
  const skillsFromDoc = NORTHWIND_SKILLS.filter((s) =>
    s.factIds.some((fid) => factsFromDoc.some((f) => f.id === fid))
  );

  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-7xl px-6 pt-8 pb-16 flex-1 w-full">
        <Link
          href="/sources"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-3" /> All sources
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <SourceIcon type={doc.source} size={22} />
              <span className="text-xs text-muted-foreground">
                {sourceLabel(doc.source)}
              </span>
              <span className="text-muted-foreground/50">·</span>
              <Badge variant="muted">{doc.kind}</Badge>
              {doc.channel && (
                <span className="text-xs font-mono text-muted-foreground inline-flex items-center gap-1">
                  <Hash className="size-3" />
                  {doc.channel.replace(/^#/, "")}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 leading-tight">
              {doc.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8">
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3" />
                {doc.author}
                {doc.authorRole ? ` · ${doc.authorRole}` : ""}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3" />
                updated {formatRelativeTime(doc.updatedAt)}
              </span>
              <span>·</span>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                Open in {sourceLabel(doc.source)}
                <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <Markdown>{doc.body}</Markdown>
            </div>
          </div>

          <aside className="space-y-5">
            {factsFromDoc.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                  Facts extracted from this doc
                </p>
                <div className="space-y-3">
                  {factsFromDoc.map((fact) => (
                    <div key={fact.id} className="text-sm">
                      <Badge variant="muted" className="text-[10px] mb-1.5">
                        {fact.type} · {fact.topic}
                      </Badge>
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {fact.statement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skillsFromDoc.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                  Skills this doc shaped
                </p>
                <div className="flex flex-col gap-2">
                  {skillsFromDoc.map((s) => (
                    <Link
                      key={s.name}
                      href={`/skills/${s.name}`}
                      className="text-xs font-mono text-primary hover:underline truncate"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {doc.tags && doc.tags.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((t) => (
                    <Badge key={t} variant="muted" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
