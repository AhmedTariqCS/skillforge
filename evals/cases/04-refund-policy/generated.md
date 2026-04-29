---
name: handling-customer-refund-requests
description: Guides Customer Success teammates through Refund Policy v3, covering eligibility by plan tier and timing, approval authority thresholds, required processing steps in Salesforce/Stripe/NetSuite, and safe customer communication. Use when a customer requests a refund, credit, or money back, when evaluating whether a billing concession is appropriate, or when escalating a refund decision to VP CS or CFO. Also use when distinguishing refund requests from SLA credit claims. Do not use for SLA outage credits, which follow a separate process.
---

# Handling Customer Refund Requests (Policy v3)

## When to use this skill

Use this skill whenever a customer asks for a refund, partial refund, money back, or billing concession on a Starter, Growth, or Enterprise plan. Also use it when triaging whether a request belongs in the refund process or the SLA credit process.

Refund Policy v3 is current. It supersedes v2, which capped all refunds at $5,000 regardless of plan tier — that cap no longer applies.

## Hard rules

- DO NOT promise a refund in writing before approval is confirmed.
- DO NOT issue a refund for an outage covered by the SLA; route those to the SLA credit process.
- DO NOT process the same refund through both Stripe and NetSuite. Pick one.
- DO NOT skip the Salesforce decision log using the `RFND-2026` template.
- NEVER apply the old v2 $5,000 cap; eligibility is now governed by plan tier and timing.

## Eligibility matrix

Eligibility depends on the plan tier and the time elapsed since contract start date.

| Plan | Within 30 days | 30–90 days | After 90 days |
|------|----------------|------------|---------------|
| Starter | Full refund | Pro-rated refund | Service credit only |
| Growth | Full refund | Pro-rated refund | Service credit only |
| Enterprise | Full refund | Full refund | Pro-rated credit (max 6 months) |

Notes:
- For Starter and Growth, after 90 days only service credit is available — no cash refund.
- For Enterprise, cash refunds remain available through 90 days; after that, credit is capped at 6 months pro-rated value.

## Approval authority

Approval is required before any refund is communicated as final.

| Refund amount | Approver |
|---------------|----------|
| Up to $2,500 | CSM (no escalation needed) |
| $2,500 – $25,000 | VP CS |
| Over $25,000 | CFO |

Round up to the higher tier when in doubt. A $2,500 refund sits at the CSM/VP CS boundary — escalate to VP CS.

## Workflow

Follow these steps in order for every refund request:

1. **Verify account details in Salesforce.** Confirm the plan tier (Starter / Growth / Enterprise) and the contract start date. Use the start date — not the renewal date — to compute the 30/90-day windows.
2. **Classify the request.** Determine whether it is:
   - *Product-quality-related* (bugs, broken features, data issues) — apply more generous judgment within the matrix.
   - *Preference-related* (customer changed their mind, internal reorg, etc.) — stay within the strict matrix.
3. **Gather evidence for quality issues.** If product-quality-related, pull the relevant support ticket IDs and/or incident IDs and attach them to the case.
4. **Confirm this is not an SLA matter.** If the root cause is a tracked SLA outage, stop and route the customer to the SLA credit process instead.
5. **Get approval at the right tier** (see authority table). Do not commit to the customer until approval is recorded.
6. **Process the money movement once.** Use Stripe for a refund to the original payment method, or NetSuite for a credit memo. Never both for the same request.
7. **Log the decision in Salesforce** on the customer's account using the `RFND-2026` template. Include amount, approver, classification, and ticket/incident IDs if applicable.

## Customer communication

Until approval is cleared, use non-committal language. Acceptable phrasing:

- "I'll look into what we can do here and get back to you."
- "Let me review the details on your account and confirm next steps."

Avoid phrasing that implies a guarantee, such as "We'll refund you" or "You'll see the money back by Friday," before approval is on file.

Once approval is recorded, communicate the specific amount, the method (Stripe refund vs. NetSuite credit), and the expected timing.

## Worked examples

- **Growth plan, day 45, customer dislikes the UI ($1,200).** Preference-related, within 30–90 day window → pro-rated refund. CSM can approve. Process via Stripe. Log with `RFND-2026`.
- **Enterprise plan, day 80, recurring data export bug ($18,000).** Product-quality-related, within 90 days → full refund eligible. Requires VP CS approval ($2,500–$25,000). Attach incident IDs.
- **Starter plan, day 200, customer wants out ($400).** After 90 days → service credit only, no cash refund. CSM-level. Issue NetSuite credit memo.
- **Enterprise plan, day 30, SLA-tracked outage.** Do not refund through this process. Route to the SLA credit process.
- **Any plan, $30,000 refund.** CFO approval required before any commitment to the customer.

## Quick checklist

- [ ] Plan tier and contract start date verified in Salesforce
- [ ] Quality vs. preference classification made
- [ ] Confirmed not an SLA credit case
- [ ] Ticket/incident IDs attached (if quality)
- [ ] Approval secured at correct tier
- [ ] Processed via Stripe OR NetSuite (not both)
- [ ] Decision logged in Salesforce with `RFND-2026` template
- [ ] Customer communication used safe language until approval