---
name: handling-deploy-freezes
description: Determines whether a proposed change can ship during an active deploy freeze and routes hotfixes through the correct approver. Use when an engineer is about to deploy to production, when a feature flag is about to be flipped, or when reviewing a PR during a freeze window.
---

# Handling Deploy Freezes

## When to use this skill

A deploy freeze is in effect and an engineer is about to:
- Push to production
- Flip a feature flag
- Merge a hotfix
- Deploy to staging (resolves quickly — no freeze applies)

## Hard rules

- **Do NOT ship to production** during an active freeze without explicit approval from the freeze owner or their named backup.
- **Do NOT flip feature flags on net-new features** during a freeze. Flag flips count as deploys.
- **Always assume the freeze is still active** unless an explicit "freeze lifted" announcement has been posted.

## Scope

- Production deploys: **frozen**.
- Staging deploys: **allowed** (used for QA continues).
- Risk-mitigation feature flag flips (off → safer state): **allowed**.

## Hotfix workflow

1. Open a PR against the relevant branch.
2. Tag the freeze owner AND the named backup approver.
3. Wait for explicit approval before merging. Do not "ship-then-tell".
4. After merge, post in the announcement channel confirming what shipped.

## Default rule for ambiguity

Stop and ask first. The cost of waiting until Monday is lower than the cost of firefighting on Wednesday.

## How to confirm the freeze has lifted

The freeze owner posts a "freeze lifted" message in the announcement channel. If no such message has been posted, assume the freeze is still in effect.
