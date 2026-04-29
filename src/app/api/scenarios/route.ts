import { NextResponse } from "next/server";
import { DEMO_SCENARIOS } from "@/lib/seed/northwind";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ scenarios: DEMO_SCENARIOS });
}
