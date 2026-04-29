---
name: handling-usage-based-pricing-exceptions
description: Guides account executives and RevOps reviewers through evaluating, scoping, and routing non-standard usage-based pricing requests, including custom tiers, capped commitments, usage-based trials, and retroactive adjustments. Use this skill whenever a customer asks for pricing terms that deviate from published usage bands or standard list renewal terms, or when reviewing an exception submission for approval routing, required artifacts, forbidden combinations, or minimum cap thresholds.
---

# Handling Usage-Based Pricing Exceptions

## When to use this skill

Apply this skill whenever a customer requests any of the following:

- A custom usage tier above or below the published bands.
- A capped commitment (e.g., "we'll commit to $X but never go above").
- A trial of usage-based pricing in place of a flat seat license.
- A retroactive adjustment after a customer has exceeded their tier.

Do not apply this skill to standard renewals at list pricing.

## Hard rules

- DO NOT approve any cap below $10k/month unless it is paired with an annual prepay; such caps are automatically rejected.
- DO NOT combine a cap and a retroactive adjustment in the same exception request. Pick one.
- DO NOT combine a custom tier with monthly billing. Custom tiers must be annual.
- DO NOT combine a free usage-based trial with a custom tier. Trials are off-list pricing only; custom tiers require a signed contract.
- NEVER accept "the customer asked for it" as strategic justification.

## Approval authority by annual contract value

| Annual contract value | Required approver(s) |
|-----------------------|----------------------|
| $0 – $25k             | AE                   |
| $25k – $100k          | Hannah (RevOps lead) |
| $100k – $500k         | CRO + CFO            |
| Above $500k           | CRO + CFO + CEO      |

Route every request to the correct tier based on ACV. A request that mixes tiers (e.g., a multi-year deal with escalating ACV) routes to the highest applicable approver.

## Required artifacts before submission

Every exception request must include all three of the following:

1. **Usage forecast** built from the customer's current data volume, using the forecast template in Notion.
2. **Comparable customers** — at least one comp pulled from the comp tracker.
3. **Strategic justification** — a documented reason such as land-and-expand, displacement of an incumbent, or marquee logo value. Customer request alone does not qualify.

If any artifact is missing, return the request to the AE before routing for approval.

## Submission and review workflow

1. AE files the request through the Salesforce template **UBE-2026**.
2. Confirm the three required artifacts are attached and the forbidden combinations checklist is clear.
3. Hannah reviews AE-tier requests within **1 business day**.
4. Hannah routes CRO/CFO-tier requests with a target of **3 business days**.
5. Once approved, log the deal in the comp tracker so it becomes a future comp.

## Pre-submission checklist

- [ ] ACV calculated and approver tier identified.
- [ ] Cap (if any) is at or above $10k/month, OR an annual prepay is attached.
- [ ] No cap + retroactive adjustment combination.
- [ ] No custom tier + monthly billing combination.
- [ ] No free trial + custom tier combination.
- [ ] Usage forecast attached (Notion template).
- [ ] At least one comp from the comp tracker attached.
- [ ] Strategic justification documented beyond customer request.
- [ ] Filed via Salesforce UBE-2026.

## Worked examples

**Example 1 — Auto-reject.** Customer asks for an $8k/month cap with monthly billing on a $90k ACV deal. Reject the cap structure: it is below the $10k/month threshold and has no annual prepay. If the AE wants to proceed, restructure as an annual prepay or raise the cap, then route to Hannah for the $25k–$100k tier.

**Example 2 — Forbidden combination.** Customer wants a custom tier billed monthly. Refuse the monthly billing term. Custom tiers must be annual; offer the custom tier on annual billing instead.

**Example 3 — Routing.** A $250k ACV custom-tier request with a valid forecast, one comp, and displacement justification routes to CRO + CFO with a 3 business day target.

**Example 4 — Cap + retroactive.** Customer blew through their tier and now wants both a forgiveness credit and a forward cap. Decline the combination. The AE chooses either the retroactive adjustment or the cap, then resubmits.

## Logging after approval

Every approved exception must be added to the comp tracker with ACV, structure (cap, custom tier, trial, retroactive), approver, and strategic justification. This entry becomes a valid comp for future exception requests.