"use client";

import { useEffect, useState } from "react";
import { Hash, FileText, GitBranch, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_LINES = [
  '---\nname: handling-refund-requests',
  'description: Decides whether a customer is eligible for a refund and which approval path...',
  '---',
  '# Handling Refund Requests',
  '',
  '> This skill encodes Northwind\'s **current refund policy (v3)**.',
  '',
  '## Authority matrix',
  '| Amount       | Approver |',
  '|--------------|----------|',
  '| ≤ $2,500     | CSM      |',
  '| $2,500–25k   | VP CS    |',
  '| > $25,000    | CFO      |',
];

export function HeroVisual() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= SAMPLE_LINES.length) return;
    const t = setTimeout(() => {
      setRevealed((r) => r + 1);
    }, revealed === 0 ? 600 : 180);
    return () => clearTimeout(t);
  }, [revealed]);

  return (
    <div className="relative max-w-5xl mx-auto pt-2 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.4fr] gap-6 items-center">
        {/* Source cards */}
        <div className="grid grid-cols-2 gap-3">
          <SourceCard
            icon={<Hash className="size-3.5" />}
            label="Slack"
            text="#cs-policies — refund cap update, Apr 8"
            tone="purple"
            delay={0}
          />
          <SourceCard
            icon={<FileText className="size-3.5" />}
            label="Notion"
            text="Refund Policy v3 (current)"
            tone="zinc"
            delay={120}
          />
          <SourceCard
            icon={<GitBranch className="size-3.5" />}
            label="GitHub"
            text="PM-2026-02-14 post-mortem"
            tone="dark"
            delay={240}
          />
          <SourceCard
            icon={<MessageCircle className="size-3.5" />}
            label="Intercom"
            text="TICK-4488: Lumen Labs refund"
            tone="blue"
            delay={360}
          />
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center justify-center py-2 lg:py-0">
          <div className="hidden lg:flex flex-col items-center">
            <Flow direction="right" />
          </div>
          <div className="lg:hidden flex justify-center">
            <Flow direction="down" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-primary/80 font-medium mt-2 lg:mt-3 font-mono">
            compile
          </p>
        </div>

        {/* Output: SKILL.md preview */}
        <div className="rounded-xl border border-primary/40 bg-card overflow-hidden shadow-2xl shadow-primary/10">
          <div className="border-b border-border bg-muted/40 px-3 py-1.5 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="size-2 rounded-full bg-zinc-700" />
              <div className="size-2 rounded-full bg-zinc-700" />
              <div className="size-2 rounded-full bg-zinc-700" />
            </div>
            <p className="text-[10px] font-mono text-muted-foreground ml-1">
              skills/handling-refund-requests/SKILL.md
            </p>
          </div>
          <div className="p-3 max-h-[280px] overflow-hidden">
            <pre className="text-[10px] font-mono leading-relaxed">
              {SAMPLE_LINES.slice(0, revealed).map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "animate-fade-up",
                    i < 3
                      ? "text-primary/80"
                      : line.startsWith("#")
                        ? "text-foreground font-semibold"
                        : line.startsWith(">")
                          ? "text-muted-foreground italic"
                          : line.startsWith("|")
                            ? "text-foreground/80"
                            : "text-foreground/90"
                  )}
                >
                  {line || " "}
                </div>
              ))}
              {revealed < SAMPLE_LINES.length && (
                <span className="inline-block w-1.5 h-3 bg-primary/70 align-middle animate-pulse" />
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceCard({
  icon,
  label,
  text,
  tone,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  tone: "purple" | "zinc" | "dark" | "blue";
  delay: number;
}) {
  const tones: Record<string, string> = {
    purple: "border-purple-500/30 bg-purple-500/5 text-purple-300",
    zinc: "border-zinc-500/30 bg-zinc-500/5 text-zinc-300",
    dark: "border-zinc-700/50 bg-zinc-900/40 text-zinc-200",
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-300",
  };
  return (
    <div
      className={cn(
        "rounded-lg border p-3 backdrop-blur animate-fade-up",
        tones[tone]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="opacity-90">{icon}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
          {label}
        </span>
      </div>
      <p className="text-[11px] text-foreground/80 leading-snug truncate">{text}</p>
    </div>
  );
}

function Flow({ direction }: { direction: "right" | "down" }) {
  return (
    <svg
      width={direction === "right" ? "60" : "20"}
      height={direction === "right" ? "20" : "60"}
      viewBox={direction === "right" ? "0 0 60 20" : "0 0 20 60"}
      fill="none"
    >
      <defs>
        <linearGradient
          id="flow-grad"
          x1="0"
          y1="0"
          x2={direction === "right" ? "60" : "0"}
          y2={direction === "right" ? "0" : "60"}
        >
          <stop offset="0%" stopColor="hsl(142, 76%, 56%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(142, 76%, 56%)" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(142, 76%, 56%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {direction === "right" ? (
        <>
          <line
            x1="0"
            y1="10"
            x2="60"
            y2="10"
            stroke="url(#flow-grad)"
            strokeWidth="1"
          />
          <path
            d="M50 5 L60 10 L50 15"
            stroke="hsl(142, 76%, 56%)"
            strokeWidth="1"
            fill="none"
          />
        </>
      ) : (
        <>
          <line
            x1="10"
            y1="0"
            x2="10"
            y2="60"
            stroke="url(#flow-grad)"
            strokeWidth="1"
          />
          <path
            d="M5 50 L10 60 L15 50"
            stroke="hsl(142, 76%, 56%)"
            strokeWidth="1"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
