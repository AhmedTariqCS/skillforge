import { NextResponse } from "next/server";
import { NORTHWIND_SOURCES, NORTHWIND_DOCS } from "@/lib/seed/northwind";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    sources: NORTHWIND_SOURCES,
    documents: NORTHWIND_DOCS.map((d) => ({
      id: d.id,
      source: d.source,
      kind: d.kind,
      title: d.title,
      author: d.author,
      authorRole: d.authorRole,
      channel: d.channel,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      url: d.url,
      tags: d.tags,
      excerpt: d.body.slice(0, 280),
    })),
  });
}
