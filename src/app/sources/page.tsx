import Link from "next/link";
import { Clock, Hash, FileText, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { SourceIcon, sourceLabel } from "@/components/source-icon";
import {
  NORTHWIND_DOCS,
  NORTHWIND_SOURCES,
  NORTHWIND_INFO,
} from "@/lib/seed/northwind";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { SourceType } from "@/lib/types";

export const metadata = {
  title: "Sources — Skillforge",
  description: "The connected sources and ingested documents for the Northwind demo.",
};

const KIND_LABELS: Record<string, string> = {
  policy: "Policy",
  runbook: "Runbook",
  decision: "Decision",
  thread: "Thread",
  ticket: "Ticket",
  "post-mortem": "Post-mortem",
  spec: "Spec",
  wiki: "Wiki",
};

export default function SourcesPage() {
  const grouped = NORTHWIND_SOURCES.map((src) => ({
    src,
    docs: NORTHWIND_DOCS.filter((d) => d.source === src.type),
  }));

  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-16 flex-1 w-full">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">{NORTHWIND_DOCS.length} documents</Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {NORTHWIND_SOURCES.length} sources connected · last sync{" "}
              {NORTHWIND_INFO.stats.lastSync}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Connected sources
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            What Skillforge ingested from Northwind. Click any document to see
            its full content and which skills it contributed to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {NORTHWIND_SOURCES.map((src) => (
            <SourceSummaryCard key={src.type} src={src} />
          ))}
        </div>

        <div className="space-y-10">
          {grouped.map(({ src, docs }) => (
            <section key={src.type}>
              <div className="flex items-center gap-3 mb-4">
                <SourceIcon type={src.type} size={28} />
                <h2 className="text-xl font-semibold tracking-tight">
                  {sourceLabel(src.type)}
                </h2>
                <Badge variant="muted">{docs.length}</Badge>
              </div>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/sources/${doc.id}`}
                    className="group block rounded-lg border border-border bg-card hover:border-primary/40 transition-colors p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Badge variant="muted" className="text-[10px]">
                            {KIND_LABELS[doc.kind] ?? doc.kind}
                          </Badge>
                          {doc.channel && (
                            <span className="text-[11px] font-mono text-muted-foreground inline-flex items-center gap-1">
                              <Hash className="size-3" />
                              {doc.channel.replace(/^#/, "")}
                            </span>
                          )}
                          {doc.tags?.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] text-muted-foreground"
                            >
                              · {t}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors mb-1">
                          {doc.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {truncate(
                            doc.body
                              .replace(/[#*>`]/g, "")
                              .replace(/\n+/g, " ")
                              .trim(),
                            180
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-2 inline-flex items-center gap-3">
                          <span>{doc.author}</span>
                          {doc.authorRole && (
                            <span className="text-muted-foreground/70">
                              · {doc.authorRole}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {formatRelativeTime(doc.updatedAt)}
                          </span>
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

function SourceSummaryCard({
  src,
}: {
  src: {
    type: SourceType;
    name: string;
    docCount: number;
    status: string;
    lastSync: string;
  };
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <SourceIcon type={src.type} size={28} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">
            {sourceLabel(src.type)}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {src.name}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FileText className="size-3" />
          {src.docCount} docs
        </span>
        <Badge variant="success" className="text-[10px]">
          synced · {src.lastSync}
        </Badge>
      </div>
    </div>
  );
}
