import type { Chunk, PipelineInput, PipelineSource } from "./types";

// Stage 1: chunking. We split input into pieces that stay semantically
// coherent (don't split mid-thread, mid-section). Each chunk inherits
// source provenance. We also try to infer a date stamp per chunk so that
// later stages can rank by recency.

const CHUNK_TARGET_CHARS = 2400;
const CHUNK_OVERLAP = 240;
const MIN_CHUNK_CHARS = 600;

export function chunk(input: PipelineInput): Chunk[] {
  const text = input.text.trim();
  if (text.length === 0) return [];

  const segments = semanticSplit(text);
  const merged: string[] = [];
  let buf = "";
  for (const seg of segments) {
    if (buf.length + seg.length + 2 > CHUNK_TARGET_CHARS && buf.length > 0) {
      merged.push(buf.trim());
      // Carry over a small overlap for context
      const tail = buf.slice(-CHUNK_OVERLAP);
      buf = tail + "\n\n" + seg;
    } else {
      buf = buf ? buf + "\n\n" + seg : seg;
    }
  }
  if (buf.trim().length > 0) {
    if (
      merged.length > 0 &&
      buf.length < MIN_CHUNK_CHARS
    ) {
      // Tiny tail — fold into previous
      merged[merged.length - 1] += "\n\n" + buf.trim();
    } else {
      merged.push(buf.trim());
    }
  }

  return merged.map<Chunk>((text, index) => ({
    id: `chunk-${index}`,
    index,
    text,
    source: input.source,
    inferredDate: inferDate(text, input.source),
  }));
}

// Split on natural boundaries:
// - Markdown headings
// - Slack message boundaries (** Name ** [date])
// - Blank lines between paragraphs (when sections are very long)
function semanticSplit(text: string): string[] {
  const out: string[] = [];
  // Try markdown headings first
  const headingSplit = text.split(/\n(?=##? )/);
  for (const section of headingSplit) {
    if (section.length <= CHUNK_TARGET_CHARS) {
      out.push(section.trim());
      continue;
    }
    // Try Slack message boundary
    const slackSplit = section.split(/\n(?=\*\*[^*\n]+\*\*\s*\[)/);
    if (slackSplit.length > 1 && slackSplit.every((s) => s.length < CHUNK_TARGET_CHARS)) {
      out.push(...slackSplit.map((s) => s.trim()));
      continue;
    }
    // Fall back to paragraph split
    const paraSplit = section.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    out.push(...paraSplit);
  }
  return out.filter((s) => s.length > 0);
}

// Best-effort date inference. We look for ISO dates, [Mon DD, YYYY] style timestamps,
// and "[Apr 8, 3:45 PM]" Slack-format timestamps. We return the LATEST date we find
// in the chunk — this represents "most recently this knowledge was active."
function inferDate(text: string, source?: PipelineSource): string | undefined {
  const dates: Date[] = [];

  // ISO 8601
  const iso = text.match(/\b\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)?\b/g) ?? [];
  for (const s of iso) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) dates.push(d);
  }

  // "Mon DD, YYYY" or "Mon DD YYYY"
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const monthRegex = new RegExp(
    `\\b(?:${months.join("|")})\\s+\\d{1,2},?\\s+\\d{4}\\b`,
    "gi"
  );
  const monthMatches = text.match(monthRegex) ?? [];
  for (const s of monthMatches) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) dates.push(d);
  }

  // Slack-style "[Apr 8, 3:45 PM]" — has no year, fall back to source year
  const slackTime = text.match(
    new RegExp(`\\[(?:${months.join("|")})\\s+\\d{1,2},?\\s+\\d{1,2}:\\d{2}\\s*[AP]M\\]`, "gi")
  );
  if (slackTime && slackTime.length > 0 && source?.updatedAt) {
    const sourceYear = new Date(source.updatedAt).getUTCFullYear();
    for (const s of slackTime) {
      const cleaned = s.replace(/[\[\]]/g, "") + ` ${sourceYear}`;
      const d = new Date(cleaned);
      if (!isNaN(d.getTime())) dates.push(d);
    }
  }

  if (dates.length === 0) return source?.updatedAt;

  // Latest date wins
  const latest = dates.reduce((a, b) => (a > b ? a : b));
  return latest.toISOString();
}
