---
name: handling-billing-migration-deploy-freeze
description: Enforces the production deploy freeze that runs from Monday 9am PT through Tuesday 5pm PT during the account billing migration verification window. Use this skill whenever an engineer, agent, or automation considers shipping to production, flipping a feature flag, merging a hotfix, or otherwise altering production behavior during the freeze, and to determine whether the freeze is still active.
---

# Handling the Billing Migration Deploy Freeze

## When to use this skill

Apply this skill any time a production change is proposed during the account billing migration verification window. Specifically, use it when:

- Someone asks whether they can deploy, merge, release, or roll out to production.
- A feature flag toggle is proposed for production.
- A hotfix is being prepared during the freeze window.
- It is unclear whether the freeze has lifted.
- A request involves staging — to confirm staging is unaffected.

## Freeze window

| Property | Value |
|---|---|
| Starts | Monday 9:00 AM PT |
| Ends | Tuesday 5:00 PM PT (after the migration verification report lands) |
| Scope | Production only |
| Staging | Unaffected — staging deploys are permitted |
| Lift signal | Explicit announcement from Priya Shah in the channel |

## Hard rules

- DO NOT deploy to production between Monday 9am PT and Tuesday 5pm PT unless the change has been explicitly approved under the hotfix procedure below.
- DO NOT toggle feature flags on net-new or untested features in production during the freeze — flag flips count as deploys.
- DO NOT ship-then-tell. NEVER merge a hotfix before a reviewer approves the PR.
- NEVER assume the freeze has lifted without an explicit lift announcement from Priya Shah. If no announcement is visible, treat the freeze as active.
- DO NOT make any production change during the freeze without first stopping and asking. The default is stop-and-ask.

## Default decision rule

For any proposed production change during the window:

1. Stop.
2. Ask Priya Shah or Ravi Patel before executing.
3. Proceed only after explicit approval.

"Slow on Monday" is preferred over "firefighting on Wednesday."

## What is and is not allowed during the freeze

| Action | Allowed? | Required step |
|---|---|---|
| Production deploy of new work | No | Wait until freeze lifts |
| Staging deploy | Yes | None (proceed normally) |
| Hotfix to production | Yes, conditionally | PR + approval from Priya Shah or Ravi Patel before merge |
| Feature flag flip — risk mitigation (e.g., disabling a misbehaving feature) | Yes | Confirm it is risk-mitigation, then proceed; ask if uncertain |
| Feature flag flip — turning on net-new or untested feature in prod | No | Wait until freeze lifts |
| Configuration change in production | Treat as deploy | Stop and ask first |

## Hotfix procedure

For any hotfix during the freeze:

1. Open a pull request — no direct commits, no out-of-band patches.
2. Request review from **Priya Shah** or **Ravi Patel**.
3. Wait for explicit approval on the PR.
4. Merge only after approval is recorded.
5. Notify the channel after deployment.

Ship-then-tell is prohibited. Approval must precede the merge, not follow it.

## Feature flag guidance

Feature flag changes in production are treated as deploys during this window.

- Allowed: flipping a flag **off** to mitigate risk, disable a problematic code path, or roll back exposure.
- Not allowed: flipping a flag **on** to expose net-new functionality or any feature that has not been verified in production.
- If unsure whether a flip qualifies as risk mitigation, stop and ask Priya Shah or Ravi Patel.

## Determining whether the freeze is still active

1. Check the channel for a lift announcement from Priya Shah.
2. If a lift announcement is present and timestamped at or after Tuesday 5pm PT, the freeze is over.
3. If no announcement is visible, **assume the freeze is still active**, even if it is past Tuesday 5pm PT.
4. Do not infer the lift from the migration verification report alone — the announcement is the authoritative signal.

## Examples

- *"Can QA deploy the new export feature to staging on Monday afternoon?"* → Yes. Staging is not frozen.
- *"I have a one-line bug fix for production on Tuesday at 11am PT."* → Treat as a hotfix. Open a PR, get approval from Priya Shah or Ravi Patel, then merge.
- *"I want to flip on the new pricing experiment flag in prod Monday."* → Not allowed. Net-new feature flag flips are prohibited during the freeze.
- *"The new checkout flag is causing errors — can I turn it off?"* → Risk-mitigation flip. Allowed; confirm with Priya Shah or Ravi Patel if there is any doubt.
- *"It's Tuesday 5:30pm PT and I haven't seen a lift announcement — can I deploy?"* → No. Without an announcement, assume frozen.

## Escalation contacts

- **Priya Shah** — primary approver and freeze owner; posts the lift announcement.
- **Ravi Patel** — secondary approver for hotfixes and flag-flip questions.