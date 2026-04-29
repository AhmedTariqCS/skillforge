import { NextResponse } from "next/server";
import { NORTHWIND_DOCS } from "@/lib/seed/northwind";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const doc = NORTHWIND_DOCS.find((d) => d.id === id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  return NextResponse.json({ doc });
}
