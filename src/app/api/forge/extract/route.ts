import { NextRequest } from "next/server";
import { runPipeline, type CandidateFact } from "@/lib/pipeline";
import { recordEvent } from "@/lib/activity";

export const runtime = "nodejs";
export const maxDuration = 90;

interface Body {
  text: string;
  hint?: string;
  source?: {
    type?: string;
    title?: string;
    author?: string;
    authorRole?: string;
    updatedAt?: string;
  };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const text = (body.text ?? "").trim();
  if (text.length < 80) {
    return new Response("Text too short — paste at least a paragraph.", {
      status: 400,
    });
  }
  if (text.length > 12000) {
    return new Response("Text too long — keep under 12,000 characters.", {
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // controller closed
        }
      };

      try {
        recordEvent("forge_run").catch(() => {});

        let factIndex = 0;
        const result = await runPipeline(
          {
            text,
            hint: body.hint,
            source: body.source
              ? {
                  type:
                    (body.source.type as
                      | "slack"
                      | "notion"
                      | "drive"
                      | "github"
                      | "intercom"
                      | "linear"
                      | "email"
                      | undefined) ?? "drive",
                  title: body.source.title,
                  author: body.source.author,
                  authorRole: body.source.authorRole,
                  updatedAt: body.source.updatedAt,
                }
              : undefined,
          },
          {
            onStage: (stage, status) => {
              if (status === "start") {
                send("stage", { name: stage });
              } else if (status === "ok") {
                send("stage_done", { name: stage });
              } else {
                send("stage_error", { name: stage });
              }
            },
            onCandidateFact: (fact: CandidateFact) => {
              send("fact", { index: factIndex++, fact });
            },
            onSkillDelta: (delta: string) => {
              send("skill_delta", { text: delta });
            },
          }
        );

        send("skill_done", {
          name: result.skill.name,
          description: result.skill.description,
          body: result.skill.body,
          fullText: result.skill.raw,
          totalElapsedMs:
            new Date(result.trace.finishedAt!).getTime() -
            new Date(result.trace.startedAt).getTime(),
          factCount: result.candidateFacts.length,
          resolvedFactCount: result.resolvedFacts.length,
          conflictCount: result.conflicts.length,
          validation: result.validation,
          trace: {
            stages: result.trace.stages,
            costUsd: result.trace.totalCostUsd,
          },
        });

        send("end", { ok: true });
      } catch (err) {
        send("error", {
          stage: "pipeline",
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
