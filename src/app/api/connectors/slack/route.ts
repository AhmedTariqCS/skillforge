import { NextRequest, NextResponse } from "next/server";
import {
  parseChannelJson,
  summarizeParse,
  filterValuableThreads,
} from "@/lib/connectors/slack";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  channelName: string;
  channelJson: string; // raw JSON of one channel's export file
}

// Parses uploaded Slack channel JSON and returns extracted threads.
// The web /forge UI calls this when a user uploads a Slack export file.
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.channelName || !body.channelJson) {
    return NextResponse.json(
      { error: "channelName and channelJson are required" },
      { status: 400 }
    );
  }

  let threads;
  try {
    threads = parseChannelJson(body.channelName, body.channelJson);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Parse failed" },
      { status: 400 }
    );
  }

  const filtered = filterValuableThreads(threads);
  const summary = summarizeParse(threads);

  return NextResponse.json({
    summary,
    valuableThreads: filtered.map((t) => ({
      threadTs: t.threadTs,
      startedAt: t.startedAt,
      participants: t.participants,
      messageCount: t.messages.length,
      excerpt: t.text.slice(0, 240),
      text: t.text,
    })),
  });
}
