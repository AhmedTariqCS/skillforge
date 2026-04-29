---
name: migrating-tenants-to-routing-v2
description: Guides migration of tenants from Routing Engine v1 (rule-based DAG) to Routing Engine v2, including the per-tenant feature flag, the migration CLI, v2's new capabilities (multi-team round-robin with skill weighting, time-zone aware on-call rotation, 24-hour sticky assignment), and breaking changes between v1 fallback chains and v2 escalation trees. Use this skill when planning or executing a routing engine migration, evaluating whether a tenant can move to v2, debugging differences between v1 and v2 routing behavior, or answering questions about the rollout status of Routing Engine v2.
---

# Migrating tenants to Routing Engine v2

## When to use this skill

Apply this skill when:

- A tenant requests new routing capabilities not supported by v1 (round-robin with skill weighting, time-zone aware on-call, sticky assignment).
- A CSM is preparing a migration plan for an existing tenant.
- A new tenant is being onboarded and the default flag state needs to be confirmed.
- Someone reports unexpected escalation behavior after migration and v1 vs. v2 semantics need to be compared.
- Custom routing rules (e.g., Lumen Labs–style) need to be evaluated for v2 compatibility.

## Rollout status

- Routing Engine v2 shipped on 2026-02-01.
- New tenants: v2 is default-on at sign-up.
- Existing tenants: v2 is default-off and migrated case-by-case through the tenant's CSM.

## Hard rules

- DO NOT assume v1 "fallback chain" semantics carry over; v2 "escalation tree" semantics are stricter and require deliberate redesign.
- DO NOT auto-migrate a tenant with custom routing rules without a CSM-led redesign — some v1 rules have no 1:1 v2 mapping.
- NEVER enable `feature.routing_v2` for an existing tenant without first running the migration tool for that tenant.
- DO NOT change the default flag state globally; the per-tenant flag exists so migrations stay case-by-case.

## What v2 adds over v1

| Capability | Routing v1 (rule-based DAG) | Routing v2 |
|---|---|---|
| Multi-team round-robin with skill weighting | Not supported | Supported |
| Time-zone aware on-call rotation for support escalation | Not supported | Supported |
| Sticky assignment within a 24-hour window | Not supported | Supported |
| Fallback handling | "Fallback chain" | "Escalation tree" (stricter) |

## Feature flag

- Flag name: `feature.routing_v2`
- Scope: per-tenant
- Default for existing customers: OFF
- Default for new sign-ups: ON

## Migration workflow

For an existing tenant requesting v2:

1. Confirm the request is sponsored by the tenant's CSM. Migrations are case-by-case, not self-serve.
2. Inventory the tenant's current v1 routing configuration. Flag any custom rules (Lumen Labs–style or otherwise) that may not map 1:1 to v2.
3. For unmappable rules, work with the CSM to redesign them as v2 escalation trees before flipping the flag. Treat v1 fallback chains as requiring manual translation, not lift-and-shift.
4. Run the migration tool:
   ```
   bin/migrate_routing.ts <tenant_id>
   ```
5. Enable `feature.routing_v2` for that `tenant_id`.
6. Validate v2 behavior against the redesigned rules, paying particular attention to escalation paths, on-call rotation across time zones, and 24-hour sticky assignment.
7. Hand back to the CSM for tenant-side acceptance.

## Examples

- A new tenant signs up: no action needed. `feature.routing_v2` is ON by default and v2 capabilities are available immediately.
- An existing tenant asks for round-robin with skill weighting: this is a v2-only capability. Initiate the migration workflow above; do not attempt to emulate it in v1.
- An existing tenant has Lumen Labs–style custom routing: do not run `bin/migrate_routing.ts` until the CSM has confirmed a v2 redesign for the rules without a 1:1 mapping.
- Post-migration, escalation appears to "skip" a step that worked under v1: this is expected if the original logic relied on fallback-chain semantics. Re-express the intent as a v2 escalation tree.