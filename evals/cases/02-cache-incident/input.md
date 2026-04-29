# PM-2026-03-22: Search service stale-cache outage

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
- "Tribal knowledge" workarounds are bugs, not features.
