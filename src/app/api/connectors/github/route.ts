import { NextRequest, NextResponse } from "next/server";
import { fetchIssues, filterValuableIssues } from "@/lib/connectors/github";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  repo: string; // owner/repo
  limit?: number;
  labels?: string[];
}

// Fetches issues from a public GitHub repo and returns those that look
// like decisions or post-mortems (filterValuableIssues).
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.repo || !/^[\w.-]+\/[\w.-]+$/.test(body.repo)) {
    return NextResponse.json(
      { error: "repo must be 'owner/repo' format" },
      { status: 400 }
    );
  }

  try {
    const records = await fetchIssues({
      repo: body.repo,
      limit: Math.min(body.limit ?? 25, 50),
      labels: body.labels,
      token: process.env.GITHUB_TOKEN,
    });
    const filtered = filterValuableIssues(records);
    return NextResponse.json({
      total: records.length,
      valuable: filtered.length,
      issues: filtered.map((r) => ({
        number: r.number,
        title: r.title,
        url: r.url,
        state: r.state,
        author: r.author,
        labels: r.labels,
        updatedAt: r.updatedAt,
        excerpt: r.text.slice(0, 280),
        text: r.text,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fetch failed" },
      { status: 500 }
    );
  }
}
