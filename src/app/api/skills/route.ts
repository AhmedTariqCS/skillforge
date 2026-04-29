import { NextResponse } from "next/server";
import { NORTHWIND_SKILLS } from "@/lib/seed/skills";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    skills: NORTHWIND_SKILLS.map((s) => ({
      name: s.name,
      description: s.description,
      topic: s.topic,
      lastUpdatedAt: s.lastUpdatedAt,
      bodyLength: s.body.length,
      factCount: s.factIds.length,
    })),
  });
}
