"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Send,
  Sparkles,
  AlertCircle,
  Brain,
  BookOpen,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  Hammer,
  Mail,
  Library,
  Trophy,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { Markdown } from "./markdown";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { DemoScenario } from "@/lib/types";

interface DoneEvent {
  text: string;
  skillsUsed: string[];
  citedDocIds: string[];
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

type Channel = "with" | "without";

interface ColumnState {
  text: string;
  done?: DoneEvent;
  error?: string;
}

const initial = (): ColumnState => ({ text: "" });

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  "scenario-refund": <Mail className="size-3.5" />,
  "scenario-pricing": <Hash className="size-3.5" />,
  "scenario-incident": <AlertCircle className="size-3.5" />,
};

export function DemoClient({ scenarios }: { scenarios: DemoScenario[] }) {
  const [scenarioId, setScenarioId] = useState<string>(
    scenarios[0]?.id ?? ""
  );
  const [prompt, setPrompt] = useState<string>(scenarios[0]?.prompt ?? "");
  const [running, setRunning] = useState(false);
  const [withCol, setWithCol] = useState<ColumnState>(initial());
  const [withoutCol, setWithoutCol] = useState<ColumnState>(initial());
  const [showSkillDetails, setShowSkillDetails] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  function selectScenario(s: DemoScenario) {
    if (running) return;
    setScenarioId(s.id);
    setPrompt(s.prompt);
    setWithCol(initial());
    setWithoutCol(initial());
    setShowSkillDetails(false);
  }

  function reset() {
    setWithCol(initial());
    setWithoutCol(initial());
    setShowSkillDetails(false);
  }

  async function run() {
    if (running) return;
    if (!prompt.trim()) return;
    reset();
    setRunning(true);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, scenarioId: scenarioId || undefined }),
        signal: abortRef.current.signal,
      });
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(() => "Unknown error");
        throw new Error(txt || `HTTP ${res.status}`);
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
      const msg = err instanceof Error ? err.message : "Unknown error";
      setWithCol((c) => ({ ...c, error: msg }));
      setWithoutCol((c) => ({ ...c, error: msg }));
    } finally {
      setRunning(false);
    }
  }

  // Scroll to summary when done
  useEffect(() => {
    if (withCol.done && withoutCol.done && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [withCol.done, withoutCol.done]);

  function parseEvent(raw: string) {
    let event = "message";
    let dataStr = "";
    for (const line of raw.split("\n")) {
      if (line.startsWith("event: ")) event = line.slice(7).trim();
      else if (line.startsWith("data: ")) dataStr += line.slice(6);
    }
    let data: unknown = {};
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }
    const d = data as { text?: string; message?: string } & DoneEvent;
    if (event === "with_delta" && d.text) {
      setWithCol((c) => ({ ...c, text: c.text + d.text }));
    } else if (event === "without_delta" && d.text) {
      setWithoutCol((c) => ({ ...c, text: c.text + d.text }));
    } else if (event === "with_done") {
      setWithCol((c) => ({ ...c, done: d }));
    } else if (event === "without_done") {
      setWithoutCol((c) => ({ ...c, done: d }));
    } else if (event === "with_error") {
      setWithCol((c) => ({ ...c, error: d.message ?? "stream error" }));
    } else if (event === "without_error") {
      setWithoutCol((c) => ({ ...c, error: d.message ?? "stream error" }));
    }
  }

  const bothDone = withCol.done && withoutCol.done;
  const showCallout = bothDone && (withCol.done?.skillsUsed.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-tight">
            Pick a scenario
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => selectScenario(s)}
              disabled={running}
              className={cn(
                "rounded-lg border p-4 text-left transition-all hover:bg-muted/40 disabled:opacity-60 disabled:cursor-not-allowed",
                scenarioId === s.id
                  ? "border-primary/60 bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-primary">
                  {SCENARIO_ICONS[s.id] ?? <Sparkles className="size-3.5" />}
                </span>
                <Badge variant="muted" className="text-[10px]">
                  {s.persona}
                </Badge>
              </div>
              <p className="text-sm font-medium leading-snug">{s.title}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
          Or write your own
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Northwind's brain something..."
          className="min-h-24 mb-3"
          disabled={running}
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">
            Both agents see the same prompt. Only one has the brain.
          </p>
          <div className="flex gap-2">
            {bothDone && (
              <Button onClick={reset} variant="outline" disabled={running}>
                <RefreshCw className="size-4" /> Clear
              </Button>
            )}
            <Button
              onClick={run}
              disabled={running || !prompt.trim()}
              size="default"
            >
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Running…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Run side-by-side
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Column
          channel="without"
          title="Vanilla agent"
          subtitle="Claude with no company context"
          icon={<AlertCircle className="size-4 text-muted-foreground" />}
          state={withoutCol}
          running={running}
        />
        <Column
          channel="with"
          title="With Skillforge brain"
          subtitle="Claude + Northwind skills"
          icon={<Brain className="size-4 text-primary" />}
          highlight
          state={withCol}
          running={running}
        />
      </div>

      {showCallout && (
        <div ref={summaryRef} className="space-y-4">
          {/* Summary callout */}
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="size-9 rounded-md bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Trophy className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">
                  The brain made the difference.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Same model, same prompt. The right column had access to{" "}
                  <span className="text-foreground font-medium">
                    {withCol.done!.skillsUsed.length}{" "}
                    {withCol.done!.skillsUsed.length === 1 ? "skill" : "skills"}
                  </span>
                  {withCol.done!.citedDocIds.length > 0 && (
                    <>
                      {" "}
                      from{" "}
                      <span className="text-foreground font-medium">
                        {withCol.done!.citedDocIds.length} source{" "}
                        {withCol.done!.citedDocIds.length === 1
                          ? "document"
                          : "documents"}
                      </span>
                    </>
                  )}
                  . That&apos;s the entire delta.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Stat
                label="Skills loaded"
                value={withCol.done!.skillsUsed.length}
                accent="primary"
              />
              <Stat
                label="Sources cited"
                value={withCol.done!.citedDocIds.length}
                accent="primary"
              />
              <Stat
                label="With brain"
                value={`${withCol.done!.latencyMs}ms`}
                detail={`${withCol.done!.outputTokens} tokens`}
              />
              <Stat
                label="Without brain"
                value={`${withoutCol.done!.latencyMs}ms`}
                detail={`${withoutCol.done!.outputTokens} tokens`}
              />
            </div>

            <div className="border-t border-primary/20 pt-4">
              <button
                onClick={() => setShowSkillDetails((s) => !s)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
              >
                <ChevronDown
                  className={cn(
                    "size-3 transition-transform",
                    showSkillDetails && "rotate-180"
                  )}
                />
                {showSkillDetails ? "Hide" : "Show"} skills the brain loaded
              </button>
              {showSkillDetails && (
                <div className="mt-3 space-y-2 animate-fade-up">
                  {withCol.done!.skillsUsed.map((name) => (
                    <Link
                      key={name}
                      href={`/skills/${name}`}
                      className="flex items-center justify-between rounded-md border border-border bg-card p-3 hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BookOpen className="size-4 text-primary shrink-0" />
                        <span className="text-sm font-mono truncate">
                          {name}
                        </span>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Next steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <NextStepCard
              icon={<Hammer className="size-4" />}
              title="Try the live compiler"
              detail="Paste your own text. Watch a SKILL.md compile in real time."
              href="/forge"
              cta="Open forge"
            />
            <NextStepCard
              icon={<Library className="size-4" />}
              title="Browse all 7 skills"
              detail="See every SKILL.md in full. Trace each fact to its source."
              href="/skills"
              cta="Skill library"
            />
            <NextStepCard
              icon={<Mail className="size-4" />}
              title="Talk to the founder"
              detail="If this is solving a real pain for you, I want to know."
              href="mailto:ahmedtariqcs@gmail.com"
              cta="Email Ahmed"
              external
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Column({
  channel,
  title,
  subtitle,
  icon,
  state,
  highlight,
  running,
}: {
  channel: Channel;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  state: ColumnState;
  highlight?: boolean;
  running: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card flex flex-col min-h-[420px]",
        highlight ? "border-primary/40" : "border-border"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b px-4 py-3",
          highlight ? "border-primary/30 bg-primary/5" : "border-border"
        )}
      >
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none truncate">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        </div>
        {state.done && (
          <Badge variant={highlight ? "default" : "muted"} className="shrink-0">
            {state.done.latencyMs}ms · {state.done.outputTokens} tok
          </Badge>
        )}
        {running && !state.done && !state.error && (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {state.error ? (
          <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-md p-3">
            <p className="font-semibold mb-1">Error</p>
            <p>{state.error}</p>
          </div>
        ) : state.text ? (
          <Markdown compact>{state.text}</Markdown>
        ) : running ? (
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-3 w-2/5 rounded bg-muted" />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div
              className={cn(
                "size-10 rounded-full flex items-center justify-center mb-3",
                highlight ? "bg-primary/10" : "bg-muted"
              )}
            >
              {icon}
            </div>
            <p className="text-sm text-muted-foreground">
              {highlight ? "Brain-loaded response" : "No-context response"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Run a scenario to see the stream.
            </p>
          </div>
        )}
      </div>
      {channel === "with" && state.done && state.done.skillsUsed.length > 0 && (
        <div className="border-t border-primary/20 bg-primary/5 px-4 py-2 text-xs text-muted-foreground">
          Loaded:{" "}
          <span className="text-foreground font-mono break-words">
            {state.done.skillsUsed.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: number | string;
  detail?: string;
  accent?: "primary";
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-semibold tracking-tight tabular-nums",
          accent === "primary" ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </p>
      {detail && <p className="text-[10px] text-muted-foreground mt-0.5">{detail}</p>}
    </div>
  );
}

function NextStepCard({
  icon,
  title,
  detail,
  href,
  cta,
  external,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  href: string;
  cta: string;
  external?: boolean;
}) {
  const inner = (
    <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/40 transition-colors h-full flex flex-col">
      <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
        {detail}
      </p>
      <p className="text-xs text-primary inline-flex items-center gap-1 font-medium">
        {cta} <ArrowRight className="size-3" />
      </p>
    </div>
  );
  if (external) {
    return (
      <a href={href} target={href.startsWith("mailto:") ? undefined : "_blank"}>
        {inner}
      </a>
    );
  }
  return <Link href={href}>{inner}</Link>;
}
