import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (development) or Vercel env vars (production)."
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

// Models — keep in one place so we can swap easily
export const MODELS = {
  // High-quality extraction & synthesis
  extract: "claude-opus-4-7",
  // Fast agent responses for the live demo
  agent: "claude-sonnet-4-6",
  // Cheap classification / triage
  classify: "claude-haiku-4-5-20251001",
} as const;

export interface ClaudeCallOptions {
  model?: string;
  maxTokens?: number;
  system?: string;
  temperature?: number;
}

export async function complete(
  prompt: string,
  opts: ClaudeCallOptions = {}
): Promise<{ text: string; usage: { input: number; output: number } }> {
  const client = getClaude();
  const res = await client.messages.create({
    model: opts.model ?? MODELS.agent,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [{ role: "user", content: prompt }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return {
    text,
    usage: {
      input: res.usage.input_tokens,
      output: res.usage.output_tokens,
    },
  };
}

export interface StreamOptions extends ClaudeCallOptions {
  onDelta?: (text: string) => void;
}

export async function* streamComplete(
  prompt: string,
  opts: StreamOptions = {}
): AsyncGenerator<string, void, unknown> {
  const client = getClaude();
  const stream = client.messages.stream({
    model: opts.model ?? MODELS.agent,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [{ role: "user", content: prompt }],
  });
  for await (const ev of stream) {
    if (
      ev.type === "content_block_delta" &&
      ev.delta.type === "text_delta"
    ) {
      yield ev.delta.text;
      opts.onDelta?.(ev.delta.text);
    }
  }
}
