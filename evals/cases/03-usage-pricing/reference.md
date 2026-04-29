---
name: approving-usage-based-pricing-exceptions
description: Routes usage-based pricing exception requests through the correct approver, blocks forbidden combinations, and ensures all required artifacts are present before submission. Use when an AE is preparing a custom usage tier, a capped commitment, a usage-based trial, or a retroactive adjustment.
---

# Approving Usage-Based Pricing Exceptions

## When to use this skill

A customer is requesting any of:
- A custom usage tier outside the published bands.
- A capped commitment ("we'll commit to $X but never go above").
- A trial of usage-based pricing instead of seat licensing.
- A retroactive adjustment after blowing through their tier.

This skill does NOT apply to standard renewals at list price.

## Authority

| Annual contract value | Approver |
|-----------------------|----------|
| Up to $25k | AE (with required artifacts) |
| $25k–$100k | Hannah Lin (RevOps lead) |
| $100k–$500k | CRO + CFO |
| Above $500k | CRO + CFO + CEO |

## Hard rules

- **Caps below $10k/month are auto-rejected unless paired with an annual prepay.** Reference: lost upside on Lumeo (Q3 2025) and Trellix (Q4 2025).
- **Do NOT combine a cap with a retroactive adjustment.** Pick one.
- **Do NOT combine a usage-based trial with a custom tier.** Trials are off-list only; custom tiers require a signed contract.
- **Custom tiers cannot be billed monthly.** Custom tiers must be annual.

## Required artifacts (all three required before submission)

1. Usage forecast based on customer's current data volume (use the Notion forecast template).
2. At least one comparable customer pulled from the comp tracker.
3. Strategic justification: land-and-expand, incumbent displacement, marquee logo, or similar. "They asked" is not a justification.

## Process

1. AE files via Salesforce template UBE-2026.
2. RevOps validates artifacts within 1 business day for AE-tier exceptions.
3. CRO/CFO requests routed by RevOps; target 3 business days.
4. After approval, log the deal in the comp tracker for future reference.

## Decision examples

- **$15k ARR, custom tier, monthly billing** — reject. Custom tiers must be annual.
- **$60k ARR cap at $5k/month, no prepay** — reject. Cap below $10k/month requires annual prepay.
- **$80k ARR, custom tier, annual prepay, displacing competitor X** — approve at RevOps tier provided artifacts complete.
