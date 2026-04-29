import { NextRequest } from "next/server";
import { streamWithBrain, streamWithoutBrain } from "@/lib/agent";
import { DEMO_SCENARIOS } from "@/lib/seed/northwind";
import { recordEvent } from "@/lib/activity";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RunBody {
  prompt: string;
  scenarioId?: string;
}

export async function POST(req: NextRequest) {
  let body: RunBody;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return new Response("Missing prompt", { status: 400 });
  }

  // If a scenario id was given, force the corresponding skills so the demo
  // is deterministic and reviewers see the brain's best-case behavior.
  let forceSkills: string[] | undefined;
  if (body.scenarioId) {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === body.scenarioId);
    if (scenario) forceSkills = scenario.relevantSkills;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        sendEvent("start", { ts: Date.now() });
        recordEvent("demo_run").catch(() => {});

        // Run both agents in parallel and interleave their deltas.
        const withGen = streamWithBrain(prompt, { forceSkills });
        const withoutGen = streamWithoutBrain(prompt);

        async function pump(
          gen: AsyncGenerator<
            { delta?: string; done?: unknown },
            void,
            unknown
          >,
          channel: "with" | "without"
        ) {
          try {
            for await (const ev of gen) {
              if (ev.delta !== undefined) {
                sendEvent(`${channel}_delta`, { text: ev.delta });
              } else if (ev.done) {
                sendEvent(`${channel}_done`, ev.done);
              }
            }
          } catch (err) {
            sendEvent(`${channel}_error`, {
              message: err instanceof Error ? err.message : "Stream error",
            });
          }
        }

        await Promise.all([pump(withGen, "with"), pump(withoutGen, "without")]);
        sendEvent("end", { ts: Date.now() });
      } catch (err) {
        sendEvent("error", {
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
