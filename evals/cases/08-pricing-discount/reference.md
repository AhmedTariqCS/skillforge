---
name: approving-sales-discounts
description: Determines whether a proposed sales discount is within AE authority, computes the multi-year boost, and routes exceptions through the correct approval path. Use when an AE drafts a discount, when a customer requests pricing concessions, or when reviewing a deal that exceeds the standard discount tiers.
---

# Approving Sales Discounts

## When to use this skill

- An AE is drafting a deal with a discount.
- A prospect is requesting pricing concessions.
- A renewal includes a discount ask.

## Standard discount ladder (AE-authorized)

| Seat count | Max discount |
|------------|--------------|
| < 25 | 0% (list only) |
| 25–99 | 15% |
| 100–249 | 25% |
| 250+ | 30% |

## Multi-year boost (additive)

- 2-year prepay: +5%
- 3-year prepay: +8%

These stack on the seat-tier ladder. Example: 150 seats with 2-year prepay → 25% + 5% = 30% AE-authorized maximum.

## Hard rules

- **Do NOT go below 40% off list without CFO sign-off.** That is the absolute floor; deeper discounts break the blended ARR model.
- **Do NOT verbally commit to a discount before Salesforce approval.** Always route through DISC-EXC first.
- **Do NOT stack discount + free seats above standard tier.** Pick one; free seats above tier require separate approval.

## Exception process

1. AE submits the exception in Salesforce using template DISC-EXC.
2. RevOps validates within 4 business hours.
3. If above AE authority, ping #sales-ops with @here and tag the VP Revenue.
4. VP Revenue responds with approve/reject + reasoning by end of day.

## Comparable deals (use as reference)

| Customer | Seats | Term | Discount | Outcome |
|----------|-------|------|----------|---------|
| TechCorp (Mar 2026) | 150 | 2yr prepay | 35% | Approved — Zendesk displacement |
| Acme Industries (Feb 2026) | 200 | 1yr | 32% | Approved |
| Lumen Labs (Jan 2026) | 80 | 3yr prepay | 38% requested → 28% accepted | Initial reject, closed at 28% |

## Decision examples

- **35% / 150 seats / 2-year**: above AE max (30%). File exception with displacement evidence; comparable: TechCorp.
- **22% / 60 seats / 1-year**: above AE max (15%). File exception; weak case without strategic justification.
- **42% / any size**: blocked by 40% floor without CFO sign-off.
