// Sample inputs for the /forge live extraction demo. These are deliberately
// different from Northwind so the demo isn't running on its own seed data —
// it's actually compiling fresh skills from new input.

export interface ForgeSample {
  id: string;
  label: string;
  hint: string;
  text: string;
}

export const FORGE_SAMPLES: ForgeSample[] = [
  {
    id: "deploys",
    label: "Slack: deploy freeze policy",
    hint: "A Slack thread from a startup engineering channel",
    text: `**Priya Shah** [Friday 4:18 PM]
Heads up everyone — I'm calling a deploy freeze starting Monday 9am PT through Tuesday EOD. Reason: the account billing migration finishes Sunday night and I want a clean window to verify before anyone ships anything else.

**Marcus Chen** [Friday 4:22 PM]
Does this include the staging deploys our QA team needs? They're testing the new export feature.

**Priya Shah**
Staging is fine. Freeze applies only to production. Hotfixes still allowed but must be PRed and approved by me or @Ravi before merging — no ship-then-tell.

**Ravi Patel** [Friday 4:31 PM]
+1, and a reminder — feature flags do count as "deploys" if you're toggling on something untested in prod. Don't flip flags on net-new features during the freeze. Risk-mitigation flips are fine.

**Priya Shah**
Yep good catch Ravi. Default rule for any prod change during the freeze: stop and ask first. We'd rather be slow Monday than firefighting Wednesday.

**Marcus Chen** [Friday 4:33 PM]
Got it. I'll let the team know in standup. When does the freeze lift exactly?

**Priya Shah**
Tuesday 5pm PT after the migration verification report lands. I'll post in this channel when it lifts. If you don't see a lift announcement, assume frozen.`,
  },
  {
    id: "incident",
    label: "Post-mortem: cache invalidation outage",
    hint: "A GitHub post-mortem doc from a past incident",
    text: `# PM-2026-03-22: Search service stale-cache outage

**Severity:** SEV2
**Duration:** 47 minutes (10:15 PM – 11:02 PM PT)
**Customer impact:** Search returned results that were 4–6 hours stale for ~15% of queries during the window.

## Timeline

- 10:15 PM — PagerDuty: search-svc reporting elevated cache hit rate (98% vs 78% baseline). Anika ack'd.
- 10:21 PM — Identified root cause: a config change earlier in the day disabled cache TTL invalidation on document updates. Eric had set it temporarily to debug a memory leak and forgot to revert.
- 10:24 PM — Anika reverted the config. Cache continued to serve stale entries.
- 10:35 PM — Anika tried to flush the cache via the admin API. Endpoint had been deprecated three weeks ago. Nobody knew.
- 10:48 PM — David (oncall lead) joined and ran an SSH-based cache flush as a last resort. Worked but is not a documented procedure.
- 11:02 PM — Cache repopulating, hit rate normalizing.

## What went wrong

1. **The config debugging "for a few minutes" lasted 6 hours.** Eric set TTL invalidation off for a memory leak investigation and lost track of it.
2. **The admin cache-flush endpoint was deprecated without a replacement.** It was used twice a year and nobody noticed when it stopped working.
3. **Our runbook had no "force flush" procedure.** SSH-based flushing was institutional knowledge held only by David.

## Action items

- [ ] **Hard rule:** any temp config flag must have an automatic 1-hour expiry. Eric to implement (due 2026-04-05).
- [ ] **Hard rule:** never deprecate an admin endpoint without a replacement linked from the runbook. Anika to add to engineering standards (due 2026-03-29).
- [ ] **Document the cache flush procedure** in the search-svc runbook. David to write up (due 2026-03-29).
- [ ] **Add a "stale cache" detection alarm** based on cache-hit-rate-vs-baseline. Anika (due 2026-04-12).

## Lessons (for the runbook)

- Temporary config changes need expiry, not memory.
- Operational endpoints used quarterly need health checks.
- "Tribal knowledge" workarounds are bugs, not features.`,
  },
  {
    id: "pricing",
    label: "Notion: usage-based pricing exception",
    hint: "A Notion page from a Series B SaaS startup's RevOps team",
    text: `# Usage-Based Pricing Exception Policy

> Owner: RevOps (Hannah Lin) · Last updated: April 2026

This page explains how AEs handle requests for non-standard usage-based pricing.

## When does this apply

A customer is asking for any of the following:

- A custom usage tier above or below our published bands.
- A capped commitment (e.g., "we'll commit to $X but never go above").
- A trial of usage-based pricing instead of a flat seat license.
- A retroactive adjustment after they've blown through their tier.

If it's a standard renewal at list, this doc does not apply.

## Authority

| Annual contract value | Approver |
|-----------------------|----------|
| Up to $25k            | AE       |
| $25k–$100k            | Hannah (RevOps lead) |
| $100k–$500k           | CRO + CFO |
| Above $500k           | CRO + CFO + CEO |

Note that **caps below $10k/month are auto-rejected** unless paired with an annual prepay. We've gotten burned twice — Lumeo Q3 2025 and Trellix Q4 2025 — where customers capped their spend and we lost the upside on growth.

## Required artifacts before exception submission

1. **Usage forecast** based on the customer's current data volume (use the forecast template in this Notion).
2. **Comparable customers** — at least one comp pulled from the comp tracker.
3. **Strategic justification** — why are we doing this exception? Land-and-expand, displacement of an incumbent, marquee logo, etc. "They asked" is not a justification.

## Forbidden combinations

- **Cap + retroactive adjustment.** Pick one. We will not honor a cap and also forgive an overage.
- **Free trial usage-based + custom tier.** Trials are off-list pricing only. Custom tiers require a signed contract.
- **Custom tier + monthly billing.** Custom tiers must be annual.

## Process

1. AE files the request via Salesforce template UBE-2026.
2. Hannah reviews within 1 business day for AE-approval-tier requests.
3. CRO/CFO requests routed by Hannah, target 3 business days.
4. Once approved, the deal is logged in the comp tracker for future reference.`,
  },
];
