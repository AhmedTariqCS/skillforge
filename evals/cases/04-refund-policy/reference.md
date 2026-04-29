---
name: handling-refund-requests
description: Decides whether a customer is eligible for a refund and routes the decision through the correct approver. Use when a customer requests a refund, a plan downgrade with money back, or a service credit, or when a CSM is drafting a response to a refund inquiry.
---

# Handling Refund Requests

## When to use this skill

A customer (or CSM acting on their behalf) is asking for:
- Money back on a current or recent purchase
- A pro-rated refund or credit for unused time
- A service credit for product-quality issues

If the request is about an SLA breach (downtime), use the SLA credit process — that is a separate workflow.

## Hard rules

- **Do NOT promise a refund in customer-facing writing before approval lands.** Use "I'll look into what we can do" until cleared.
- **Do NOT issue both a Stripe refund and a NetSuite credit memo for the same charge.** Pick one.
- **Do NOT process SLA-breach credits through this workflow.** Use the SLA credit process.

## Eligibility table

| Plan | Within 30 days | 30–90 days | After 90 days |
|------|----------------|------------|---------------|
| Starter | Full refund | Pro-rated refund | Service credit only |
| Growth | Full refund | Pro-rated refund | Service credit only |
| Enterprise | Full refund | Full refund | Pro-rated credit (max 6 months) |

## Authority

| Amount | Approver |
|--------|----------|
| Up to $2,500 | CSM (no escalation) |
| $2,500–$25,000 | VP Customer Success |
| Above $25,000 | CFO |

## Workflow

1. Pull the plan tier and contract start date from Salesforce.
2. Determine whether the request is product-quality (be generous) or preference (apply policy strictly).
3. If product-quality, attach the relevant ticket or incident IDs as context.
4. Get approval at the right tier.
5. Process via Stripe (cash refund) OR NetSuite (credit memo).
6. Log the decision in Salesforce using the RFND-2026 template.

## Customer-facing language

Before approval:
> "Thanks for sharing this — let me look at your account and what we can do, and I'll come back to you with a clear answer within one business day."

After approval:
> "Based on your contract (Plan: [TIER], started [DATE]) and our refund policy, we can offer you [AMOUNT]. [Cash refund: this will hit your card within 5–10 business days. / Credit: this will appear as a credit memo on your next invoice.]"

## Note on policy version

This workflow encodes Refund Policy v3, which supersedes v2's flat $5k cap. Do not reference v2 in customer communication.
