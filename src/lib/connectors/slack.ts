// Slack export connector.
// Slack's "export workspace data" produces a ZIP containing per-channel
// JSON files. Each channel file contains an array of message objects.
// We parse the JSON, group messages into threads, and produce text suitable
// for the pipeline.
//
// Public docs: https://slack.com/help/articles/201658943-Export-your-workspace-data

export interface SlackMessage {
  type?: string;
  subtype?: string;
  user?: string;
  user_profile?: {
    real_name?: string;
    display_name?: string;
    name?: string;
    title?: string;
  };
  text?: string;
  ts?: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{ name: string; count: number }>;
}

export interface SlackThread {
  channel: string;
  threadTs: string;
  startedAt: string;
  participants: string[];
  messages: SlackMessage[];
  text: string; // formatted for pipeline ingestion
}

export interface ParseResult {
  threads: SlackThread[];
  totalMessages: number;
  channels: string[];
}

// Parse a single channel's exported JSON. Channel name should be the file's
// parent folder (Slack export layout: <export>/<channel-name>/YYYY-MM-DD.json).
export function parseChannelJson(
  channelName: string,
  raw: string
): SlackThread[] {
  let messages: SlackMessage[];
  try {
    messages = JSON.parse(raw);
  } catch {
    throw new Error(
      `Could not parse Slack export JSON for channel ${channelName}: not valid JSON`
    );
  }
  if (!Array.isArray(messages)) {
    throw new Error(
      `Expected an array in ${channelName} export, got ${typeof messages}`
    );
  }

  // Group into threads. A "root" message is one whose ts === thread_ts (or thread_ts is missing)
  // and replies share the same thread_ts.
  const byThread = new Map<string, SlackMessage[]>();
  for (const msg of messages) {
    if (msg.subtype && SKIP_SUBTYPES.has(msg.subtype)) continue;
    if (!msg.ts) continue;
    const threadKey = msg.thread_ts ?? msg.ts;
    const arr = byThread.get(threadKey) ?? [];
    arr.push(msg);
    byThread.set(threadKey, arr);
  }

  const threads: SlackThread[] = [];
  for (const [threadTs, msgs] of byThread.entries()) {
    msgs.sort((a, b) => Number(a.ts) - Number(b.ts));
    const participants = Array.from(
      new Set(
        msgs
          .map((m) => m.user_profile?.real_name ?? m.user_profile?.name ?? m.user)
          .filter((s): s is string => Boolean(s))
      )
    );
    const startedAt = new Date(Number(threadTs) * 1000).toISOString();
    const text = formatThread(msgs);
    threads.push({
      channel: channelName,
      threadTs,
      startedAt,
      participants,
      messages: msgs,
      text,
    });
  }

  threads.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  return threads;
}

const SKIP_SUBTYPES = new Set([
  "channel_join",
  "channel_leave",
  "channel_topic",
  "channel_purpose",
  "channel_archive",
  "channel_unarchive",
  "bot_message",
]);

function formatThread(msgs: SlackMessage[]): string {
  const lines: string[] = [];
  for (const m of msgs) {
    const author =
      m.user_profile?.real_name ??
      m.user_profile?.display_name ??
      m.user_profile?.name ??
      m.user ??
      "Unknown";
    const role = m.user_profile?.title;
    const tsMs = Number(m.ts) * 1000;
    const date = new Date(tsMs);
    const dateStr = isNaN(date.getTime())
      ? ""
      : ` [${date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}]`;
    const header = role
      ? `**${author}** (${role})${dateStr}`
      : `**${author}**${dateStr}`;
    const body = (m.text ?? "").trim();
    if (!body) continue;
    lines.push(header);
    lines.push(body);
    lines.push("");
  }
  return lines.join("\n").trim();
}

export function summarizeParse(threads: SlackThread[]): ParseResult {
  const channels = new Set<string>();
  let totalMessages = 0;
  for (const t of threads) {
    channels.add(t.channel);
    totalMessages += t.messages.length;
  }
  return {
    threads,
    totalMessages,
    channels: Array.from(channels),
  };
}

// Convenience: filter threads to those that look "decision-y" — i.e., where
// extraction is most likely to produce useful skills. We use cheap heuristics
// (keyword match + length).
export function filterValuableThreads(threads: SlackThread[]): SlackThread[] {
  const keywords =
    /\b(decided|policy|rule|never|always|do not|don't|approve|reject|escalat|incident|post-mortem|hotfix|freeze|deploy|sla|outage|exception|migration|breaking change|deprecated)\b/i;
  return threads.filter((t) => {
    if (t.text.length < 200) return false;
    if (t.messages.length < 2) return false;
    return keywords.test(t.text);
  });
}
