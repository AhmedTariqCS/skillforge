---
name: handling-routing-engine-migration
description: Decides how to migrate or onboard a tenant onto Routing Engine v2, flags incompatible v1 rules, and surfaces the per-tenant feature flag and migration tool. Use when a CSM is onboarding a new tenant, when a tenant requests v2 features, or when reviewing existing v1 routing rules.
---

# Handling Routing Engine Migration

## When to use this skill

- A new tenant is signing up and routing must be configured.
- An existing tenant requests v2 features (multi-team round-robin with skill weighting, time-zone aware on-call rotation, or sticky assignment within a 24-hour window).
- A tenant is reporting that their v1 rules behave unexpectedly.

## Defaults

- New sign-ups: routing v2 default-on (`feature.routing_v2 = true`).
- Existing tenants: routing v2 default-off; migration is per-tenant via CSM.

## Migration steps

1. Confirm the tenant's existing v1 routing configuration.
2. Identify any rules that may not map 1:1 to v2 (especially fallback-chain → escalation-tree differences; custom rules require redesign).
3. For tenants with non-trivial customizations, schedule a working session with the CSM and the tenant's admin.
4. Run `bin/migrate_routing.ts <tenant_id>` once the new configuration is agreed.
5. Set `feature.routing_v2 = true` for the tenant.
6. Monitor for 24 hours.

## Known breaking changes

- v1 "fallback chain" semantics differ from v2 "escalation tree" semantics (the v2 version is stricter).
- Custom routing rules that depended on v1's permissive fallback may not have a direct mapping. Reference: Lumen Labs migration required a redesign worked through their CSM.

## What not to do

- Do not flip `feature.routing_v2` for an existing tenant without a migration session.
- Do not assume v1 fallback chain semantics translate to v2 escalation trees.
