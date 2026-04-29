// GitHub connector. Fetches issues and discussions from a public repo
// using the unauthenticated REST API (60 req/hour). For authenticated
// access we accept a GITHUB_TOKEN env var (5000 req/hour).
//
// We focus on closed issues / merged PRs / discussions because those
// contain decisions worth extracting. Open issues are typically asks,
// not knowledge.

export interface GitHubFetchInput {
  // owner/repo, e.g. "facebook/react"
  repo: string;
  // Limit (default 25). The free API window is 60 req/hour.
  limit?: number;
  token?: string;
  // Filter to issues/discussions matching these labels (any-of)
  labels?: string[];
}

export interface GitHubIssueRecord {
  number: number;
  title: string;
  url: string;
  state: "open" | "closed";
  author: string;
  authorRole?: string;
  createdAt: string;
  closedAt?: string;
  updatedAt: string;
  labels: string[];
  body: string;
  comments: Array<{
    author: string;
    createdAt: string;
    body: string;
  }>;
  text: string; // formatted for pipeline ingestion
}

interface RawIssue {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  user?: { login: string };
  author_association?: string;
  created_at: string;
  closed_at: string | null;
  updated_at: string;
  labels: Array<{ name: string }>;
  body: string | null;
  comments: number;
  comments_url?: string;
  pull_request?: unknown;
}

interface RawComment {
  user?: { login: string };
  created_at: string;
  body: string;
}

const HEADERS = (token?: string): Record<string, string> => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export async function fetchIssues(
  input: GitHubFetchInput
): Promise<GitHubIssueRecord[]> {
  const limit = Math.min(input.limit ?? 25, 100);
  const labelQuery =
    input.labels && input.labels.length > 0
      ? `&labels=${encodeURIComponent(input.labels.join(","))}`
      : "";
  const issuesUrl = `https://api.github.com/repos/${input.repo}/issues?state=closed&per_page=${limit}&sort=updated${labelQuery}`;

  const res = await fetch(issuesUrl, { headers: HEADERS(input.token) });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        `GitHub rate limit hit. Pass a GITHUB_TOKEN to extend the limit to 5000 req/hour.`
      );
    }
    if (res.status === 404) {
      throw new Error(`Repo ${input.repo} not found or not public.`);
    }
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  }
  const issues = (await res.json()) as RawIssue[];

  // Hydrate comments for each issue (limit to top 10 to stay within rate limit)
  const records: GitHubIssueRecord[] = [];
  for (const issue of issues.slice(0, limit)) {
    let comments: GitHubIssueRecord["comments"] = [];
    if (issue.comments > 0 && issue.comments_url) {
      const cRes = await fetch(`${issue.comments_url}?per_page=10`, {
        headers: HEADERS(input.token),
      });
      if (cRes.ok) {
        const raw = (await cRes.json()) as RawComment[];
        comments = raw.map((c) => ({
          author: c.user?.login ?? "unknown",
          createdAt: c.created_at,
          body: c.body ?? "",
        }));
      }
    }
    records.push({
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      state: issue.state,
      author: issue.user?.login ?? "unknown",
      authorRole: issue.author_association,
      createdAt: issue.created_at,
      closedAt: issue.closed_at ?? undefined,
      updatedAt: issue.updated_at,
      labels: issue.labels.map((l) => l.name),
      body: issue.body ?? "",
      comments,
      text: formatIssue(issue, comments),
    });
  }

  return records;
}

function formatIssue(
  issue: RawIssue,
  comments: GitHubIssueRecord["comments"]
): string {
  const lines: string[] = [];
  lines.push(`# ${issue.title}`);
  lines.push("");
  lines.push(
    `*Issue #${issue.number} · ${issue.state} · opened by ${issue.user?.login ?? "unknown"} on ${issue.created_at}${
      issue.closed_at ? ` · closed ${issue.closed_at}` : ""
    }*`
  );
  if (issue.labels.length > 0) {
    lines.push(`*Labels: ${issue.labels.map((l) => l.name).join(", ")}*`);
  }
  lines.push("");
  if (issue.body) {
    lines.push(issue.body.trim());
  }
  for (const c of comments) {
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push(`**${c.author}** [${c.createdAt}]`);
    lines.push("");
    lines.push(c.body.trim());
  }
  return lines.join("\n");
}

// Filter to issues/PRs that look like they contain decisions, post-mortems,
// or substantial discussion. We use multiple signals so this works on a
// variety of repos:
//   1. Title keyword match (decisions, RFCs, post-mortems, breaking changes)
//   2. Label match (post-mortem, rfc, decision, discussion, design)
//   3. Heavy comment threads (8+ comments — usually contains a decision)
//   4. Long body (1500+ chars — typical of RFCs and design docs)
// At least one signal must hit.
export function filterValuableIssues(
  records: GitHubIssueRecord[]
): GitHubIssueRecord[] {
  const titleKeywords =
    /\b(post[- ]?mortem|incident|outage|policy|decision|RFC|ADR|design[- ]doc|breaking[- ]change|migration|deprecated?|runbook|hotfix|proposal|discuss(ion)?|rationale|removed)\b/i;
  const labelKeywords = [
    "post-mortem",
    "postmortem",
    "incident",
    "rfc",
    "adr",
    "policy",
    "decision",
    "discussion",
    "design",
    "proposal",
    "breaking-change",
    "breaking change",
    "type: discussion",
    "type/discussion",
  ];
  return records.filter((r) => {
    if (titleKeywords.test(r.title)) return true;
    if (
      r.labels.some((l) => labelKeywords.includes(l.toLowerCase().trim()))
    )
      return true;
    if (r.comments.length >= 8) return true;
    if (r.body.length >= 1500) return true;
    return false;
  });
}
