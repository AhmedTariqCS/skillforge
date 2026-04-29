---
name: responding-to-search-cache-incidents
description: Diagnoses search-service cache-staleness incidents and selects safe mitigations consistent with the engineering team's hard rules from past post-mortems. Use when search results appear stale, cache hit rate has spiked above baseline, or cache TTL invalidation is suspected.
---

# Responding to Search Cache Incidents

## When to use this skill

You are on-call (or assisting) and:
- Search-service cache hit rate is materially above baseline (e.g., 98% vs 78%).
- Customers are reporting stale search results.
- A cache flush is being considered.

## Hard rules

- **Do NOT set temporary config flags without an expiry.** Every temp flag must have an automatic 1-hour expiry. Long-lived "temporary" flags caused PM-2026-03-22.
- **Do NOT deprecate admin endpoints without a documented replacement.** The deprecated cache-flush endpoint was a contributing factor to PM-2026-03-22; the replacement must be linked from the runbook.

## Diagnostic flow

1. Check the search-svc dashboard. If cache hit rate > 90% sustained for 5+ minutes, treat as suspected stale-cache.
2. Check the configuration audit log for any recent TTL or invalidation flag changes. A common pattern: a temp debug flag was set hours ago and not reverted.
3. If a config change is found, revert it first — but **a config revert alone will not flush already-stale cache entries**.

## Mitigations

| Symptom | Action | Expected duration |
|---------|--------|-------------------|
| Stale cache from disabled TTL invalidation | Revert config + flush cache via documented runbook procedure | ~10 min for cache to repopulate |
| Cache flush endpoint not working | Escalate to oncall lead — there is a documented SSH-based flush procedure (link in runbook) | ~5 min once procedure is run |
| Spike with no obvious cause | Page the on-call lead before attempting destructive operations | Depends on root cause |

## Communication

- Internal: open #inc-YYYYMMDD-search-cache.
- Customer impact > 30 min or > 10% of queries: status page update.
- Post-mortem required for SEV1 and SEV2 within 72 hours.

## After resolution

- File action items for any tribal-knowledge workarounds discovered. SSH-based fixes that aren't in the runbook are bugs, not features.
- Verify alerts exist for cache-hit-rate-vs-baseline anomaly detection.

## Reference incidents

- **PM-2026-03-22** — search-svc stale-cache outage. 47 min, SEV2, ~15% queries affected. Codified the temp-flag-expiry rule and the admin-endpoint-deprecation rule.
