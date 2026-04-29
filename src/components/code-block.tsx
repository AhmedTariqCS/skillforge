"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard.");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-md border border-border bg-background/50 overflow-hidden group relative">
      {language && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-mono text-muted-foreground bg-card px-1.5 py-0.5 rounded">
            {language}
          </span>
          <button
            onClick={copy}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <CheckCircle2 className="size-3 text-primary" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>
      )}
      <pre className="text-xs font-mono leading-relaxed text-foreground/90 p-4 overflow-x-auto">
        {code}
      </pre>
    </div>
  );
}
