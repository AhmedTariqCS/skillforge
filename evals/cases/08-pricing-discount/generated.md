---
name: handling-sales-discount-exceptions
description: Guides sales teams through quoting discounts, applying multi-year prepay bonuses, and routing pricing exceptions for B2B seat-based deals. Use when an AE is sizing a discount, evaluating whether a deal needs RevOps or CFO approval, or deciding how to handle requests that combine discounts with free seats or multi-year terms.
---

# Handling Sales Discount Exceptions

## When to use this skill

Apply this skill when:
- An AE is preparing a quote that includes any discount off list price.
- A prospect requests a multi-year prepay arrangement.
- A deal under negotiation may exceed AE-level discount authority.
- A customer asks for free seats in addition to a discount.
- RevOps or leadership needs to validate an exception request.

## Hard rules

- NEVER quote a discount on deals with fewer than 25 seats; these must be sold at list price only.
- NEVER discount more than 40% off list without explicit CFO sign-off; going below this floor breaks the blended ARR model and is flagged in the board deck.
- DO NOT make verbal discount commitments to a customer before the exception is approved in Salesforce.
- DO NOT combine a discount and free seats in the same deal; pick one approach.
- DO NOT grant free seats above the standard tier without separate approval, even if no discount is being offered.

## Standard discount ladder

| Seat count | Max AE-approved discount | Notes |
|---|---|---|
| < 25 | 0% | List price only, no exceptions |
| 25–99 | 15% | AE authority |
| 100–249 | 25% | AE authority |
| 250+ | 30% | AE authority; above 30% requires VP Revenue |

## Multi-year prepay bonus

Stack on top of the seat-tier discount:
- **2-year prepay:** +5%
- **3-year prepay:** +8%

The combined discount must still respect the 40% floor. Example: a 250-seat deal at 30% with 3-year prepay reaches 38% — allowed. The same deal pushed to 33% base would land at 41% combined and require CFO sign-off.

## Exception approval workflow

1. AE submits an exception request in Salesforce using template **DISC-EXC**.
2. RevOps validates the request against the discount matrix within **4 business hours**.
3. If the request exceeds AE authority, escalate by posting in **#sales-ops** with `@here` and tagging Maya.
4. Maya responds with approve/reject plus reasoning by **end of day**.
5. Only after written approval in Salesforce may the AE communicate the discount to the customer.

## Decision guide

- **Within seat-tier cap and ≤ 40% combined?** AE approves directly, logs in Salesforce.
- **Above seat-tier cap but ≤ 40% combined?** Submit DISC-EXC, escalate to Maya via #sales-ops.
- **Below 40% floor?** Requires CFO sign-off; route through Maya first with full justification.
- **Customer wants discount + free seats?** Choose one. If free seats exceed the standard tier, file a separate approval request.

## Reference precedents

| Deal | Seats | Discount | Term | Outcome |
|---|---|---|---|---|
| TechCorp | 150 | 35% | 2-year prepay | Approved (Zendesk displacement) |
| Acme Industries | 200 | 32% | 1-year | Approved |
| Lumen Labs | 80 | 38% | 3-year | Rejected as too aggressive; closed at 28% |

Use these as calibration points when justifying an exception. Aggressive discounts at lower seat counts (like the original Lumen Labs request) are unlikely to clear.

## Common mistakes to avoid

- Promising a discount on a call before Salesforce routing — this commits the company before approval and is a known burn pattern.
- Stacking the multi-year bonus past the 40% floor without flagging CFO approval as a dependency.
- Offering "a small number of free seats" alongside a discount as a goodwill gesture; this still violates the combination rule.
- Skipping the DISC-EXC template and escalating directly to Maya — RevOps validation is a required prior step.