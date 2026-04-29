# Routing Engine v2

## Why

Routing v1 (rule-based DAG) doesn't handle:
- Multi-team round-robin with skill weighting.
- Time-zone aware on-call rotation for support escalation.
- "Sticky" assignment within a 24-hour window.

## Migration

- v2 ships behind `feature.routing_v2` per-tenant flag.
- Default OFF for existing customers, ON for new sign-ups.
- Migration tool: `bin/migrate_routing.ts <tenant_id>`.

## Known breaking changes

- v1 "fallback chain" semantics differ from v2 "escalation tree" (more strict).
- Some Lumen Labs–style custom routing rules don't have a 1:1 v2 mapping. We worked with their CSM to redesign.

## Status

- Shipped 2026-02-01 (Jenny + Aisha)
- Default-on rolled to all new tenants.
- Existing tenants migrated case-by-case via CSM.
