import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasDb, getDb, schema } from "@/lib/db/client";
import { recordEvent } from "@/lib/activity";

export const runtime = "nodejs";

const Body = z.object({
  email: z.string().email().max(254),
  company: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // If DB is configured, persist. Otherwise log for ops.
  if (hasDb()) {
    try {
      const db = getDb();
      await db
        .insert(schema.waitlist)
        .values({
          email: parsed.email,
          company: parsed.company,
          role: parsed.role,
          notes: parsed.notes,
        })
        .onConflictDoNothing({ target: schema.waitlist.email });
    } catch (err) {
      console.error("waitlist insert failed", err);
      return NextResponse.json(
        { error: "Could not save your request. Try again shortly." },
        { status: 500 }
      );
    }
  } else {
    console.log("[waitlist:no-db]", parsed);
  }

  recordEvent("waitlist_signup").catch(() => {});
  return NextResponse.json({ ok: true });
}
