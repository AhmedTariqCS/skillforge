#!/usr/bin/env tsx
// View Skillforge waitlist signups + activity events from Neon Postgres.
//
// Usage:
//   npm run waitlist           # full report (signups + activity in last 24h + last 7d)
//   npm run waitlist:csv       # waitlist as CSV (for export to Google Sheets)
//   npm run waitlist:since 1d  # signups in the last day, hour, week, etc.
//
// Reads DATABASE_URL from .env.local. Make sure that's set first.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnv(): Record<string, string> {
  const path = resolve(ROOT, ".env.local");
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    console.error(`✖ Could not read ${path}. Run from the skillforge/ directory or copy .env.local there.`);
    process.exit(1);
  }
  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [k, ...rest] = line.split("=");
    env[k.trim()] = rest.join("=").trim();
  }
  return env;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    csv: args.includes("--csv"),
    since: undefined as string | undefined,
  };
  const sinceIdx = args.findIndex((a) => a === "--since" || a === "-s");
  if (sinceIdx >= 0 && args[sinceIdx + 1]) {
    out.since = args[sinceIdx + 1];
  }
  return out;
}

async function main() {
  const env = loadEnv();
  const db = env.DATABASE_URL;
  if (!db) {
    console.error("✖ DATABASE_URL not found in .env.local. See application/deployment_guide.md for setup.");
    process.exit(1);
  }
  const sql = neon(db);
  const args = parseArgs();

  // ── waitlist ──
  const sinceClause = args.since
    ? ` WHERE created_at > NOW() - INTERVAL '${args.since.replace(/[^0-9a-z ]/gi, "")}'`
    : "";

  const rows = (await sql.query(
    `SELECT email, company, role, notes, created_at FROM waitlist${sinceClause} ORDER BY created_at DESC`
  )) as Array<{
    email: string;
    company: string | null;
    role: string | null;
    notes: string | null;
    created_at: Date;
  }>;

  if (args.csv) {
    console.log("created_at,email,company,role,notes");
    for (const r of rows) {
      const escape = (s: string | null) => {
        if (s === null) return "";
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };
      console.log(
        [
          new Date(r.created_at).toISOString(),
          escape(r.email),
          escape(r.company),
          escape(r.role),
          escape(r.notes),
        ].join(",")
      );
    }
    return;
  }

  console.log("");
  console.log("═════════════════════════════════════════════════════");
  console.log(`  Skillforge waitlist — ${rows.length} signup${rows.length === 1 ? "" : "s"}${args.since ? ` in last ${args.since}` : " total"}`);
  console.log("═════════════════════════════════════════════════════");
  if (rows.length === 0) {
    console.log("  (no signups yet)");
  } else {
    for (const r of rows) {
      const ts = new Date(r.created_at);
      const date = ts.toISOString().slice(0, 10);
      const time = ts.toISOString().slice(11, 16);
      console.log("");
      console.log(`  ${date} ${time}  ${r.email}`);
      const detail: string[] = [];
      if (r.company) detail.push(`company: ${r.company}`);
      if (r.role) detail.push(`role: ${r.role}`);
      if (detail.length) console.log("    " + detail.join(" · "));
      if (r.notes) console.log("    notes: " + r.notes);
    }
  }

  // ── activity events summary ──
  const last24 = (await sql`
    SELECT event_type, COUNT(*)::int as n
    FROM activity_events
    WHERE occurred_at > NOW() - INTERVAL '24 hours'
    GROUP BY event_type
    ORDER BY n DESC
  `) as Array<{ event_type: string; n: number }>;
  const last7 = (await sql`
    SELECT event_type, COUNT(*)::int as n
    FROM activity_events
    WHERE occurred_at > NOW() - INTERVAL '7 days'
    GROUP BY event_type
    ORDER BY n DESC
  `) as Array<{ event_type: string; n: number }>;
  const total = (await sql`SELECT COUNT(*)::int as n FROM activity_events`) as Array<{ n: number }>;

  console.log("");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Activity events (anonymized run counts)");
  console.log("─────────────────────────────────────────────────────");
  console.log("  last 24h:");
  for (const r of last24) console.log(`    ${r.event_type.padEnd(20)} ${r.n}`);
  if (last24.length === 0) console.log("    (none)");
  console.log("  last 7 days:");
  for (const r of last7) console.log(`    ${r.event_type.padEnd(20)} ${r.n}`);
  if (last7.length === 0) console.log("    (none)");
  console.log(`  all time:           ${total[0].n}`);
  console.log("");
}

main().catch((err) => {
  console.error("✖ check-waitlist failed:", err.message);
  process.exit(1);
});
