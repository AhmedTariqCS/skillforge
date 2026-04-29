# Usage-Based Pricing Exception Policy

> Owner: RevOps (Hannah Lin) · Last updated: April 2026

This page explains how AEs handle requests for non-standard usage-based pricing.

## When does this apply

A customer is asking for any of the following:

- A custom usage tier above or below our published bands.
- A capped commitment (e.g., "we'll commit to $X but never go above").
- A trial of usage-based pricing instead of a flat seat license.
- A retroactive adjustment after they've blown through their tier.

If it's a standard renewal at list, this doc does not apply.

## Authority

| Annual contract value | Approver |
|-----------------------|----------|
| Up to $25k            | AE       |
| $25k–$100k            | Hannah (RevOps lead) |
| $100k–$500k           | CRO + CFO |
| Above $500k           | CRO + CFO + CEO |

Note that **caps below $10k/month are auto-rejected** unless paired with an annual prepay. We've gotten burned twice — Lumeo Q3 2025 and Trellix Q4 2025 — where customers capped their spend and we lost the upside on growth.

## Required artifacts before exception submission

1. **Usage forecast** based on the customer's current data volume (use the forecast template in this Notion).
2. **Comparable customers** — at least one comp pulled from the comp tracker.
3. **Strategic justification** — why are we doing this exception? Land-and-expand, displacement of an incumbent, marquee logo, etc. "They asked" is not a justification.

## Forbidden combinations

- **Cap + retroactive adjustment.** Pick one. We will not honor a cap and also forgive an overage.
- **Free trial usage-based + custom tier.** Trials are off-list pricing only. Custom tiers require a signed contract.
- **Custom tier + monthly billing.** Custom tiers must be annual.

## Process

1. AE files the request via Salesforce template UBE-2026.
2. Hannah reviews within 1 business day for AE-approval-tier requests.
3. CRO/CFO requests routed by Hannah, target 3 business days.
4. Once approved, the deal is logged in the comp tracker for future reference.
