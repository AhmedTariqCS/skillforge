"use client";

import { useState } from "react";
import {
  ChevronRight,
  GitBranch,
  Hash,
  Loader2,
  MessageSquare,
  Upload,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

type Mode = "slack" | "github";

interface SlackThreadResult {
  threadTs: string;
  startedAt: string;
  participants: string[];
  messageCount: number;
  excerpt: string;
  text: string;
}

interface GitHubIssueResult {
  number: number;
  title: string;
  url: string;
  state: "open" | "closed";
  author: string;
  labels: string[];
  updatedAt: string;
  excerpt: string;
  text: string;
}

export function ConnectorsClient() {
  const [mode, setMode] = useState<Mode>("slack");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <ModeButton
          active={mode === "slack"}
          onClick={() => setMode("slack")}
          icon={<MessageSquare className="size-4" />}
          label="Slack export"
        />
        <ModeButton
          active={mode === "github"}
          onClick={() => setMode("github")}
          icon={<GitBranch className="size-4" />}
          label="Public GitHub repo"
        />
      </div>

      {mode === "slack" ? <SlackPanel /> : <GitHubPanel />}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md border px-4 py-2 text-sm font-medium transition-colors inline-flex items-center gap-2",
        active
          ? "border-primary/60 bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:bg-muted/40"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SlackPanel() {
  const [channelName, setChannelName] = useState("eng-decisions");
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<SlackThreadResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setJson(text);
    if (!channelName || channelName === "eng-decisions") {
      setChannelName(file.name.replace(/\.json$/, ""));
    }
  }

  async function run() {
    if (loading) return;
    if (!json.trim()) {
      toast.error("Paste or upload a Slack channel export JSON.");
      return;
    }
    setLoading(true);
    setError(null);
    setThreads([]);
    try {
      const res = await fetch("/api/connectors/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, channelJson: json }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setThreads(data.valuableThreads);
      toast.success(
        `Parsed ${data.summary.totalMessages} messages · ${data.valuableThreads.length} valuable threads`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
              Channel name
            </label>
            <Input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g. eng-decisions"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
              Channel export JSON
            </label>
            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
              Slack&apos;s workspace export gives you{" "}
              <span className="font-mono">
                &lt;export&gt;/&lt;channel&gt;/YYYY-MM-DD.json
              </span>
              . Upload one or paste contents below.
            </p>
            <input
              type="file"
              accept=".json,application/json"
              onChange={onFile}
              className="hidden"
              id="slack-file"
              disabled={loading}
            />
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("slack-file")?.click()}
                disabled={loading}
              >
                <Upload className="size-3" /> Upload .json
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setJson(SAMPLE_SLACK_JSON)}
                disabled={loading}
              >
                Use sample
              </Button>
            </div>
            <Textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              placeholder="Paste Slack channel export JSON here..."
              className="min-h-[260px] font-mono text-[10px] leading-relaxed"
              disabled={loading}
              spellCheck={false}
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Parsing…
              </>
            ) : (
              <>
                <Hash className="size-4" /> Parse + filter for valuable threads
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5 min-h-[400px]">
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs">
            <p className="font-medium text-red-300 mb-1">Error</p>
            <p className="text-red-200/80 leading-relaxed">{error}</p>
          </div>
        )}
        {threads.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageSquare className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Paste a Slack export and we&apos;ll surface the threads worth
              compiling into skills.
            </p>
          </div>
        )}
        {threads.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Threads with decision signals ({threads.length})
            </p>
            {threads.map((t) => (
              <ThreadCard key={t.threadTs} thread={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThreadCard({ thread }: { thread: SlackThreadResult }) {
  function openInForge() {
    sessionStorage.setItem(
      "skillforge-prefill",
      JSON.stringify({
        text: thread.text,
        hint: `A Slack thread on ${thread.startedAt}`,
      })
    );
    window.location.href = "/forge?prefill=1";
  }
  return (
    <div className="rounded-md border border-border bg-background/40 p-3">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="muted" className="text-[10px]">
            {thread.messageCount} messages
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {new Date(thread.startedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <button
          onClick={openInForge}
          className="text-[11px] text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
        >
          Forge it <ChevronRight className="size-3" />
        </button>
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
        {thread.excerpt}
      </p>
      <p className="text-[10px] text-muted-foreground mt-2">
        {thread.participants.slice(0, 3).join(", ")}
        {thread.participants.length > 3 ? ", …" : ""}
      </p>
    </div>
  );
}

function GitHubPanel() {
  const [repo, setRepo] = useState("anthropics/skills");
  const [labels, setLabels] = useState("");
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<GitHubIssueResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (loading) return;
    if (!repo.match(/^[\w.-]+\/[\w.-]+$/)) {
      toast.error("Repo must be 'owner/repo' format.");
      return;
    }
    setLoading(true);
    setError(null);
    setIssues([]);
    try {
      const labelArr = labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
      const res = await fetch("/api/connectors/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          labels: labelArr.length > 0 ? labelArr : undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setIssues(data.issues);
      toast.success(`Fetched ${data.total} closed issues · ${data.valuable} valuable`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
              Public GitHub repo
            </label>
            <Input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="owner/repo"
              disabled={loading}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              We fetch closed issues + post-mortems. Authenticated rate
              limit if <span className="font-mono">GITHUB_TOKEN</span> is set
              on the server (5000 req/hour).
            </p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium block mb-1.5">
              Filter by labels (optional)
            </label>
            <Input
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="post-mortem, incident, decision"
              disabled={loading}
            />
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Fetching…
              </>
            ) : (
              <>
                <GitBranch className="size-4" /> Fetch closed issues
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-3 mt-2">
            Try <span className="font-mono">facebook/react</span>,{" "}
            <span className="font-mono">vercel/next.js</span>, or{" "}
            <span className="font-mono">anthropics/skills</span>.
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5 min-h-[400px]">
        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs">
            <p className="font-medium text-red-300 mb-1 inline-flex items-center gap-1.5">
              <AlertCircle className="size-3" /> Error
            </p>
            <p className="text-red-200/80 leading-relaxed">{error}</p>
          </div>
        )}
        {issues.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <GitBranch className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Issues with decision-y signals will appear here. Click any to
              run through the compiler.
            </p>
          </div>
        )}
        {issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Issues with decision signals ({issues.length})
            </p>
            {issues.map((i) => (
              <IssueCard key={i.number} issue={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IssueCard({ issue }: { issue: GitHubIssueResult }) {
  function openInForge() {
    sessionStorage.setItem(
      "skillforge-prefill",
      JSON.stringify({
        text: issue.text,
        hint: `A GitHub issue (${issue.labels.join(", ")})`,
      })
    );
    window.location.href = "/forge?prefill=1";
  }
  return (
    <div className="rounded-md border border-border bg-background/40 p-3">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <p className="text-xs font-medium leading-snug line-clamp-2 flex-1">
          {issue.title}
        </p>
        <button
          onClick={openInForge}
          className="text-[11px] text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
        >
          Forge it <ChevronRight className="size-3" />
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className="text-[10px] font-mono text-muted-foreground">
          #{issue.number}
        </span>
        {issue.labels.slice(0, 3).map((l) => (
          <Badge key={l} variant="muted" className="text-[10px]">
            {l}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">
        {issue.excerpt}
      </p>
    </div>
  );
}

const SAMPLE_SLACK_JSON = JSON.stringify(
  [
    {
      type: "message",
      ts: "1714060800.000100",
      user: "U01PRIYA",
      user_profile: {
        real_name: "Priya Shah",
        title: "Head of Operations",
      },
      text:
        "Heads up everyone — I'm calling a deploy freeze starting Monday 9am PT through Tuesday EOD. Reason: the account billing migration finishes Sunday night and I want a clean window to verify before anyone ships anything else.",
    },
    {
      type: "message",
      ts: "1714061520.000200",
      thread_ts: "1714060800.000100",
      user: "U02MARC",
      user_profile: { real_name: "Marcus Chen", title: "Senior Engineer" },
      text:
        "Does this include the staging deploys our QA team needs? They're testing the new export feature.",
    },
    {
      type: "message",
      ts: "1714061700.000300",
      thread_ts: "1714060800.000100",
      user: "U01PRIYA",
      user_profile: {
        real_name: "Priya Shah",
        title: "Head of Operations",
      },
      text:
        "Staging is fine. Freeze applies only to production. Hotfixes still allowed but must be PRed and approved by me or @Ravi before merging — no ship-then-tell.",
    },
    {
      type: "message",
      ts: "1714062060.000400",
      thread_ts: "1714060800.000100",
      user: "U03RAVI",
      user_profile: { real_name: "Ravi Patel", title: "Staff Engineer" },
      text:
        "+1, and a reminder — feature flags do count as 'deploys' if you're toggling on something untested in prod. Don't flip flags on net-new features during the freeze. Risk-mitigation flips are fine.",
    },
  ],
  null,
  2
);
