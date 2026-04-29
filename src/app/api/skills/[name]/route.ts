import { NextResponse } from "next/server";
import { getSkillByName } from "@/lib/seed/skills";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const skill = getSkillByName(name);
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }
  return NextResponse.json({ skill });
}
