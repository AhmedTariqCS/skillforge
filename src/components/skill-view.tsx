"use client";

import { useState } from "react";
import { Copy, Download, Code, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";
import type { AgentSkill } from "@/lib/types";

export function SkillView({ skill }: { skill: AgentSkill }) {
  const [view, setView] = useState<"rendered" | "raw">("rendered");
  const [copied, setCopied] = useState(false);

  const fullMarkdown = `---
name: ${skill.name}
description: ${skill.description}
---

${skill.body}`;

  function copy() {
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    toast.success("SKILL.md copied to clipboard.");
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    const blob = new Blob([fullMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between gap-3">
        <p className="text-xs font-mono text-muted-foreground truncate">
          skills/{skill.name}/SKILL.md
        </p>
        <div className="flex items-center gap-2">
          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setView("rendered")}
              className={cn(
                "text-[11px] px-2.5 py-1 inline-flex items-center gap-1 transition-colors",
                view === "rendered"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Rendered view"
            >
              <FileText className="size-3" /> Rendered
            </button>
            <button
              onClick={() => setView("raw")}
              className={cn(
                "text-[11px] px-2.5 py-1 inline-flex items-center gap-1 transition-colors border-l border-border",
                view === "raw"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Raw view"
            >
              <Code className="size-3" /> Raw
            </button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copy}
            className="h-7 px-2"
            aria-label="Copy SKILL.md"
          >
            {copied ? (
              <CheckCircle2 className="size-3 text-primary" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={download}
            className="h-7 px-2"
            aria-label="Download SKILL.md"
          >
            <Download className="size-3" />
          </Button>
          <Badge variant="muted" className="text-[10px] hidden sm:inline-flex">
            Claude Agent Skills format
          </Badge>
        </div>
      </div>
      <div className="p-6">
        {view === "rendered" ? (
          <>
            <pre className="text-xs font-mono text-primary/70 mb-4 leading-relaxed border-l-2 border-primary/40 pl-3 whitespace-pre-wrap">
              {`---
name: ${skill.name}
description: ${skill.description}
---`}
            </pre>
            <Markdown>{skill.body}</Markdown>
          </>
        ) : (
          <pre className="text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap break-words bg-background/50 border border-border rounded-md p-4">
            {fullMarkdown}
          </pre>
        )}
      </div>
    </div>
  );
}
