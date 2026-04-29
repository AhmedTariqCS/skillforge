"use client";

import { useRef, useState } from "react";
import {
  Loader2,
  Sparkles,
  Wand2,
  Copy,
  CheckCircle2,
  Hammer,
  FileText,
  Layers,
  Download,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { ForgeSample } from "@/lib/forge-samples";
import type { ForgeFact } from "@/lib/forge";

interface SkillDone {
  name: string;
  description: string;
  body: string;
  fullText: string;
  totalElapsedMs: number;
}

type Stage = "idle" | "extracting" | "synthesizing" | "done" | "error";

export function ForgeClient({ samples }: { samples: ForgeSample[] }) {
  const [text, setText] = useState<string>(samples[0]?.text ?? "");
  const [hint, setHint] = useState<string>(samples[0]?.hint ?? "");
  const [stage, setStage] = useState<Stage>("idle");
  const [facts, setFacts] = useState<ForgeFact[]>([]);
  const [skillStream, setSkillStream] = useState<string>("");
  const [skill, setSkill] = useState<SkillDone | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [extractMs, setExtractMs] = useState<number | null>(null);
  const skillRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function loadSample(s: ForgeSample) {
    if (stage !== "idle" && stage !== "done" && stage !== "error") return;
    setText(s.text);
    setHint(s.hint);
    setFacts([]);
    setSkillStream("");
    setSkill(null);
    setErrorMsg("");
    setStage("idle");
  }

  async function run() {
    if (stage === "extracting" || stage === "synthesizing") return;
    if (text.trim().length < 80) {
      toast.error("Paste at least a paragraph (80+ characters).");
      return;
    }
    setFacts([]);
    setSkillStream("");
    setSkill(null);
    setErrorMsg("");
    setStage("extracting");
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/forge/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, hint }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(t);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\n\n/);
        buffer = events.pop() ?? "";
        for (const ev of events) {
          if (!ev.trim()) continue;
          parseEvent(ev);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Forge failed";
      setErrorMsg(msg);
      setStage("error");
    }
  }

  function parseEvent(raw: string) {
    let event = "message";
    let dataStr = "";
    for (const line of raw.split("\n")) {
      if (line.startsWith("event: ")) event = line.slice(7).trim();
      else if (line.startsWith("data: ")) dataStr += line.slice(6);
    }
    let data: unknown;
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }
    const d = data as {
      name?: string;
      label?: string;
      fact?: ForgeFact;
      index?: number;
      topic?: string;
      factCount?: number;
      elapsedMs?: number;
      text?: string;
      message?: string;
      stage?: string;
      body?: string;
      description?: string;
      fullText?: string;
      totalElapsedMs?: number;
    };
    if (event === "stage") {
      if (d.name === "extracting") setStage("extracting");
      else if (d.name === "synthesizing") setStage("synthesizing");
    } else if (event === "fact" && d.fact) {
      setFacts((f) => [...f, d.fact!]);
    } else if (event === "extract_done") {
      if (typeof d.elapsedMs === "number") setExtractMs(d.elapsedMs);
    } else if (event === "skill_delta" && d.text) {
      setSkillStream((s) => s + d.text);
      // auto-scroll the skill pane
      requestAnimationFrame(() => {
        skillRef.current?.scrollTo({ top: skillRef.current.scrollHeight });
      });
    } else if (event === "skill_done") {
      setSkill({
        name: d.name ?? "untitled-skill",
        description: d.description ?? "",
        body: d.body ?? "",
        fullText: d.fullText ?? "",
        totalElapsedMs: d.totalElapsedMs ?? 0,
      });
      setStage("done");
    } else if (event === "error") {
      setErrorMsg(d.message ?? "Forge failed");
      setStage("error");
    }
  }

  function copySkill() {
    if (!skill) return;
    const md = `---
name: ${skill.name}
description: ${skill.description}
---

${skill.body}`;
    navigator.clipboard.writeText(md);
    toast.success("SKILL.md copied to clipboard.");
  }

  function downloadSkill() {
    if (!skill) return;
    const md = `---
name: ${skill.name}
description: ${skill.description}
---

${skill.body}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.name || "skill"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const running = stage === "extracting" || stage === "synthesizing";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Input pane */}
      <div className="rounded-lg border border-border bg-card flex flex-col min-h-[520px]">
        <div className="border-b border-border px-4 py-3 flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          <p className="text-sm font-semibold">Paste raw company knowledge</p>
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
              Try a sample
            </p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadSample(s)}
                  disabled={running}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors",
                    "hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed",
                    text === s.text
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a Slack thread, Notion page, post-mortem, support ticket — anything with company-specific knowledge in it."
            className="flex-1 min-h-[280px] font-mono text-xs leading-relaxed"
            disabled={running}
            spellCheck={false}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {text.length.toLocaleString()} chars{" "}
              {text.length > 12000 && (
                <span className="text-red-400">· over 12k limit</span>
              )}
            </p>
            <Button
              onClick={run}
              disabled={running || text.trim().length < 80 || text.length > 12000}
              className="gap-2"
              size="lg"
            >
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Forging…
                </>
              ) : (
                <>
                  <Hammer className="size-4" /> Forge skill
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Output pane */}
      <div className="rounded-lg border border-primary/30 bg-card flex flex-col min-h-[520px]">
        <StageBar stage={stage} factCount={facts.length} />
        <div className="flex-1 overflow-y-auto" ref={skillRef}>
          {stage === "idle" && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wand2 className="size-5 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">Ready to forge</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                We extract structured facts, then compile them into a SKILL.md
                file your AI agents can run. Real Claude calls. Real streaming.
              </p>
            </div>
          )}
          {stage === "error" && (
            <div className="p-6">
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm">
                <p className="font-medium text-red-300 mb-2">Forge failed</p>
                <p className="text-red-200/80 text-xs leading-relaxed">
                  {errorMsg}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Try again, or paste a different sample.
                </p>
              </div>
            </div>
          )}
          {(stage === "extracting" ||
            stage === "synthesizing" ||
            stage === "done") && (
            <div className="p-5 space-y-4">
              {facts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="size-4 text-primary" />
                    <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                      Extracted facts ({facts.length})
                      {extractMs !== null && (
                        <span className="text-muted-foreground/60 ml-2">
                          · {extractMs}ms
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {facts.map((f, i) => (
                      <FactRow key={i} fact={f} />
                    ))}
                  </div>
                </div>
              )}

              {(skillStream || skill) && (
                <div>
                  <div className="flex items-center gap-2 mb-3 mt-4">
                    <Layers className="size-4 text-primary" />
                    <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                      Generated SKILL.md{" "}
                      {skill && (
                        <span className="text-muted-foreground/60 ml-2">
                          · {skill.totalElapsedMs}ms total
                        </span>
                      )}
                    </p>
                    {skill && (
                      <div className="ml-auto flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={copySkill}
                          className="h-7 px-2"
                        >
                          <Copy className="size-3" /> Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={downloadSkill}
                          className="h-7 px-2"
                        >
                          <Download className="size-3" /> Download
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="rounded-md border border-border bg-background/50 overflow-hidden">
                    <div className="bg-muted/30 border-b border-border px-3 py-1.5 flex items-center justify-between">
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {skill?.name
                          ? `skills/${skill.name}/SKILL.md`
                          : "compiling…"}
                      </p>
                      {stage === "synthesizing" && (
                        <Loader2 className="size-3 animate-spin text-primary" />
                      )}
                    </div>
                    <div className="p-4">
                      <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap text-foreground/90">
                        {skillStream}
                        {stage === "synthesizing" && (
                          <span className="inline-block w-2 h-3 bg-primary/60 align-middle animate-pulse" />
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {stage === "done" && skill && (
                <div className="rounded-md border border-primary/40 bg-primary/5 p-3 mt-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    <div className="text-xs text-foreground/90 leading-relaxed">
                      Skill compiled in {skill.totalElapsedMs}ms. Drop this
                      SKILL.md into{" "}
                      <span className="font-mono text-primary">
                        ~/.claude/skills/{skill.name}/
                      </span>{" "}
                      and Claude Code uses it automatically.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StageBar({ stage, factCount }: { stage: Stage; factCount: number }) {
  const steps: { key: Stage; label: string; icon: React.ReactNode }[] = [
    { key: "extracting", label: "Extract", icon: <Lightbulb className="size-3" /> },
    { key: "synthesizing", label: "Synthesize", icon: <Wand2 className="size-3" /> },
    { key: "done", label: "Compiled", icon: <CheckCircle2 className="size-3" /> },
  ];
  const order: Stage[] = ["idle", "extracting", "synthesizing", "done"];
  const current = order.indexOf(stage);

  return (
    <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
      <Sparkles className="size-4 text-primary shrink-0" />
      <div className="flex items-center gap-1.5 flex-wrap">
        {steps.map((step, idx) => {
          const isCurrent = step.key === stage;
          const isComplete = order.indexOf(step.key) < current && stage !== "idle";
          return (
            <div key={step.key} className="flex items-center gap-1.5">
              <Badge
                variant={isCurrent ? "default" : isComplete ? "success" : "muted"}
                className={cn(
                  "text-[10px] flex items-center gap-1",
                  isCurrent && "animate-pulse"
                )}
              >
                {step.icon}
                {step.label}
                {step.key === "extracting" && factCount > 0 && (
                  <span> · {factCount}</span>
                )}
              </Badge>
              {idx < steps.length - 1 && (
                <span className="text-muted-foreground/40">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FACT_COLORS: Record<ForgeFact["type"], string> = {
  policy: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  procedure: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  decision: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  constraint: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  person: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  system: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
};

function FactRow({ fact }: { fact: ForgeFact }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-3 animate-fade-up">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border",
            FACT_COLORS[fact.type]
          )}
        >
          {fact.type}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {fact.topic}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/70">
          {Math.round(fact.confidence * 100)}%
        </span>
      </div>
      <p className="text-xs leading-relaxed text-foreground/90">
        {fact.statement}
      </p>
    </div>
  );
}
