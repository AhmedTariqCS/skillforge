---
name: responding-to-search-service-stale-cache-incidents
description: Guides incident response, prevention, and tooling standards for stale-cache outages in search-svc. Use when search-svc reports elevated cache hit rate vs baseline, when results appear stale, when introducing temporary config flags, when deprecating admin endpoints, or when updating the search-svc runbook with cache-flush procedures.
---

# Responding to search-service stale-cache incidents

This skill codifies the response, prevention rules, and engineering standards derived from the 2026-03-22 search-svc stale-cache SEV2 (47 minutes, ~15% of queries returning results 4–6 hours stale).

## When to use this skill

- A pager fires for search-svc with cache hit rate elevated above baseline (e.g., ≥98% vs ~78% baseline).
- Customers report stale search results.
- An engineer proposes a temporary config flag in search-svc or a related service.
- An engineer proposes deprecating an admin/operational endpoint.
- The search-svc runbook is being updated, especially the cache-flush section.

## Hard rules

- DO NOT introduce a temporary config flag without an automatic 1-hour expiry. NEVER rely on manual reversion or human memory to revert temp flags.
- NEVER deprecate an admin endpoint without a replacement that is linked from the runbook before the deprecation lands.

## Incident response workflow

Follow these steps in order when a stale-cache incident is suspected:

1. **Acknowledge the page** and confirm signal: compare current cache hit rate to baseline (baseline ~78%; ≥95% sustained is suspicious).
2. **Identify recent config changes** to search-svc, especially anything affecting cache TTL or invalidation. A common cause is TTL invalidation being disabled for debugging and not reverted.
3. **Revert the offending config.** Note: reverting config alone does NOT evict already-cached stale entries.
4. **Force a cache flush** using the documented runbook procedure. Do not attempt the deprecated admin cache-flush API; it was removed on 2026-03-22.
5. **If the runbook procedure fails**, escalate to oncall lead before improvising. The SSH-based flush is a documented last-resort fallback (see below) — not a first option.
6. **Verify recovery** by watching cache hit rate normalize toward baseline as the cache repopulates.
7. **Open a postmortem** if customer impact occurred or if any undocumented step was used.

## Cache flush procedure reference

| Method | Status | When to use |
|---|---|---|
| Admin cache-flush API | Deprecated as of 2026-03-22 (no documented replacement at time of incident) | Do not use |
| Documented runbook flush | Required path | First-line force flush |
| SSH-based flush | Last-resort fallback; must be documented in runbook | Only when documented flush fails and oncall lead approves |

If the runbook still lacks a documented force-flush procedure, treat documenting it as a blocking action item before closing any related incident.

## Prevention checklist for new changes

Use this checklist whenever modifying search-svc config or admin surface:

- [ ] If adding a temporary config flag, the flag has an automatic 1-hour expiry implemented in code, not a calendar reminder.
- [ ] If deprecating an admin endpoint, a replacement exists and is linked from the search-svc runbook before deprecation ships.
- [ ] Any operational endpoint used infrequently (quarterly or rarer) has a health check so silent breakage is detected.
- [ ] Any "tribal knowledge" workaround used during an incident is filed as a runbook gap and documented.

## Detection

A stale-cache detection alarm based on **cache-hit-rate-vs-baseline** is the standard signal for this class of incident. When tuning or reviewing alarms:

- Trigger on sustained deviation above baseline (baseline ~78%), not on absolute thresholds alone.
- Page the search-svc oncall directly; stale cache produces silent customer impact and will not surface via error-rate alarms.

## Worked example: the 2026-03-22 incident

- A temp config disabled cache TTL invalidation during a memory-leak debug session and was not reverted for ~6 hours.
- Reverting the config did not clear already-cached stale entries.
- The admin cache-flush API had been deprecated three weeks earlier with no replacement; the responder discovered this mid-incident.
- Recovery required an undocumented SSH-based flush known only to the oncall lead.

The rules in this skill exist to make each of those failure modes impossible or detected automatically: temp flags auto-expire, admin endpoints cannot be deprecated without a linked replacement, the SSH flush must live in the runbook, and a hit-rate-vs-baseline alarm catches the silent stale-serve window earlier.