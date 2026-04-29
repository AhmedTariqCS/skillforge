import Anthropic from "@anthropic-ai/sdk";
import { getClaude, MODELS } from "../claude";
import { scoreAuthority } from "./authority";
import type {
  CandidateFact,
  Chunk,
  FactType,
  PipelineSource,
} from "./types";

// Stage 2: per-chunk candidate fact extraction.
// We run a focused prompt against each chunk independently. This means
// large inputs scale linearly and per-chunk failures are isolated.

const EXTRACT_SYSTEM = `You are Skillforge's per-chunk fact extractor.

Read the chunk and extract structured, executable facts. Each fact must be self-contained: an agent reading just that fact understands what to do.

Output ONLY valid JSON in this exact shape:
{
  "topic": "<short topic slug for the chunk>",
  "facts": [
    {
      "type": "policy" | "procedure" | "decision" | "constraint" | "person" | "system" | "deprecated",
      "topic": "<topic slug>",
      "statement": "<1-2 sentence canonical statement>",
      "evidenceQuote": "<verbatim 1-2 line quote from the chunk that backs this fact>",
      "confidence": <number 0-1>
    }
  ]
}

Rules:
1. The "evidenceQuote" must appear in the chunk, character-for-character. If it doesn't, omit the fact.
2. "constraint" type for HARD RULES ("do not", "never", "always"). Most valuable.
3. "deprecated" type for facts the chunk explicitly marks as superseded ("v2 is archived", "the old way was X").
4. Skip facts that are generic across all companies. Focus on chunk-specific knowledge.
5. Output 0-6 facts per chunk. Quality over quantity. If the chunk has no facts worth keeping, output an empty array.
6. Confidence reflects how clearly the chunk supports the fact (0..1).`;

interface RawFact {
  type: FactType;
  topic: string;
  statement: string;
  evidenceQuote: string;
  confidence: number;
}

interface ChunkExtractionRaw {
  topic: string;
  facts: RawFact[];
}

export async function extractFromChunk(
  chunk: Chunk,
  source: PipelineSource | undefined,
  opts: { apiKey?: string; model?: string } = {}
): Promise<{
  facts: CandidateFact[];
  topic: string;
  inputTokens: number;
  outputTokens: number;
}> {
  const client = opts.apiKey
    ? new Anthropic({ apiKey: opts.apiKey })
    : getClaude();

  const res = await client.messages.create({
    model: opts.model ?? MODELS.classify,
    max_tokens: 1500,
    temperature: 0,
    system: EXTRACT_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Chunk metadata:
- Source type: ${source?.type ?? "unknown"}
- Source title: ${source?.title ?? "(no title)"}
- Author: ${source?.author ?? "(unknown)"}${source?.authorRole ? ` (${source.authorRole})` : ""}
- Updated: ${chunk.inferredDate ?? source?.updatedAt ?? "(unknown date)"}

Chunk text:
"""
${chunk.text}
"""

Extract structured facts. JSON only.`,
      },
    ],
  });

  const text = res.content
    .filter(
      (b): b is Anthropic.TextBlock =>
        (b as { type?: string }).type === "text"
    )
    .map((b) => b.text)
    .join("");

  const parsed = parseJson(text);

  const facts: CandidateFact[] = parsed.facts
    .filter((raw) => raw.evidenceQuote && raw.statement)
    .map<CandidateFact>((raw, i) => {
      const authorityScore = scoreAuthority({
        source,
        inferredDate: chunk.inferredDate,
        factType: raw.type,
        modelConfidence: raw.confidence,
      });
      return {
        id: `${chunk.id}-fact-${i}`,
        type: raw.type,
        topic: raw.topic || parsed.topic || "general",
        statement: raw.statement,
        evidenceQuote: raw.evidenceQuote,
        chunkId: chunk.id,
        confidence: raw.confidence,
        authorityScore,
        inferredDate: chunk.inferredDate,
      };
    });

  return {
    facts,
    topic: parsed.topic || "general",
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
  };
}

function parseJson(raw: string): ChunkExtractionRaw {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) {
    return { topic: "general", facts: [] };
  }
  cleaned = cleaned.slice(first, last + 1);
  try {
    const parsed = JSON.parse(cleaned) as Partial<ChunkExtractionRaw>;
    return {
      topic: parsed.topic ?? "general",
      facts: Array.isArray(parsed.facts) ? parsed.facts : [],
    };
  } catch {
    return { topic: "general", facts: [] };
  }
}
