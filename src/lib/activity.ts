// Lightweight server-side activity counter. Tracks demo runs, forge runs,
// and waitlist signups. Persists to Postgres if DATABASE_URL is set;
// otherwise keeps an in-memory counter that resets per cold start.
//
// The counter is read on landing-page render to display real usage signals.

import { hasDb, getDb } from "./db/client";
import { sql } from "drizzle-orm";

type Event = "demo_run" | "forge_run" | "waitlist_signup" | "cli_extract";

interface MemoryCounter {
  totals: Record<Event, number>;
  last24h: Record<Event, number[]>; // per-hour buckets, last 24 entries
}

const memory: MemoryCounter = {
  totals: {
    demo_run: 0,
    forge_run: 0,
    waitlist_signup: 0,
    cli_extract: 0,
  },
  last24h: {
    demo_run: new Array(24).fill(0),
    forge_run: new Array(24).fill(0),
    waitlist_signup: new Array(24).fill(0),
    cli_extract: new Array(24).fill(0),
  },
};

export async function recordEvent(event: Event): Promise<void> {
  // Always update in-memory; it's the fast path
  memory.totals[event]++;
  const hour = new Date().getUTCHours();
  memory.last24h[event][hour]++;

  if (!hasDb()) return;
  try {
    const db = getDb();
    await db.execute(
      sql`INSERT INTO activity_events (event_type, occurred_at)
          VALUES (${event}, NOW())`
    );
  } catch (err) {
    // DB failure shouldn't block the user-facing flow. Log and move on.
    console.warn("recordEvent: DB insert failed", err);
  }
}

export interface ActivitySummary {
  totals: Record<Event, number>;
  last24h: Record<Event, number>;
  source: "memory" | "db";
}

export async function readActivity(): Promise<ActivitySummary> {
  if (!hasDb()) {
    return {
      totals: { ...memory.totals },
      last24h: {
        demo_run: memory.last24h.demo_run.reduce((a, b) => a + b, 0),
        forge_run: memory.last24h.forge_run.reduce((a, b) => a + b, 0),
        waitlist_signup: memory.last24h.waitlist_signup.reduce(
          (a, b) => a + b,
          0
        ),
        cli_extract: memory.last24h.cli_extract.reduce((a, b) => a + b, 0),
      },
      source: "memory",
    };
  }
  try {
    const db = getDb();
    const totals = await db.execute<{ event_type: Event; n: number }>(
      sql`SELECT event_type, COUNT(*)::int as n
          FROM activity_events
          GROUP BY event_type`
    );
    const recent = await db.execute<{ event_type: Event; n: number }>(
      sql`SELECT event_type, COUNT(*)::int as n
          FROM activity_events
          WHERE occurred_at > NOW() - INTERVAL '24 hours'
          GROUP BY event_type`
    );
    const blank: Record<Event, number> = {
      demo_run: 0,
      forge_run: 0,
      waitlist_signup: 0,
      cli_extract: 0,
    };
    const totalsObj = { ...blank };
    for (const row of totals.rows) totalsObj[row.event_type] = row.n;
    const recentObj = { ...blank };
    for (const row of recent.rows) recentObj[row.event_type] = row.n;
    return { totals: totalsObj, last24h: recentObj, source: "db" };
  } catch (err) {
    console.warn("readActivity: DB query failed, falling back", err);
    return {
      totals: { ...memory.totals },
      last24h: {
        demo_run: memory.last24h.demo_run.reduce((a, b) => a + b, 0),
        forge_run: memory.last24h.forge_run.reduce((a, b) => a + b, 0),
        waitlist_signup: memory.last24h.waitlist_signup.reduce(
          (a, b) => a + b,
          0
        ),
        cli_extract: memory.last24h.cli_extract.reduce((a, b) => a + b, 0),
      },
      source: "memory",
    };
  }
}
