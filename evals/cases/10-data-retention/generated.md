---
name: handling-customer-data-retention-requests
description: Handles customer data deletion, export, and retention requests in compliance with GDPR, CCPA, the Master Services Agreement, and the Data Processing Addendum. Use this skill when a customer submits a deletion or export request, when MSA and DPA timelines appear to conflict, when audit log retention questions arise, or when preparing deletion certificates and confirmation emails. Covers the 7-business-day deletion workflow, 90-day backup rollover, 7-year audit log retention, and escalation paths to Erik Lindqvist (Legal).
---

# Handling customer data retention requests

## When to use this skill

Use this skill when:
- A customer submits a data deletion request via the portal or signed email to legal@northwind.com.
- A customer requests an export of their data (self-serve or bulk).
- A customer cites the MSA 30-day deletion timeline and disputes the 7-business-day DPA timeline.
- Anyone asks how long audit logs, backups, or live customer data are retained.
- A deletion certificate or confirmation email needs to be sent.

## Hard rules

- NEVER confirm deletion to a customer before backups have rolled (90 days after the deletion request).
- NEVER delete audit logs early. They must be retained for 7 years to meet regulatory requirements.
- NEVER email a deletion certificate before engineering confirms the deletion is complete.
- DO NOT commit to either the MSA 30-day timeline or the DPA 7-business-day timeline in a customer dispute without Erik's sign-off.

## Retention defaults

| Data type | Retention period | Notes |
|---|---|---|
| Live customer data | Duration of the contract | |
| Backups | 90 days after deletion request | Encrypted; rolls off automatically |
| Audit logs | 7 years | Regulatory; never delete early |

The legacy on-prem policy (5 years non-EU / 10 years EU for audit logs) was removed in 2026-Q1 and no longer applies.

## Deletion request workflow

1. Receive the request via the customer portal or signed email to legal@northwind.com.
2. Erik (or his designated backup) confirms the requester's identity within 1 business day.
3. File an engineering ticket in Linear with a target completion of 7 business days.
4. Engineering deletes the data from production and warm storage within 7 business days.
5. Backups containing the data expire over the following 90 days as backups roll.
6. After engineering confirms deletion is complete, send the customer a confirmation email with the deletion certificate.

Checklist before sending the deletion certificate:
- [ ] Engineering has confirmed prod and warm storage deletion in the Linear ticket.
- [ ] 90-day backup rollover window is acknowledged in the certificate language.
- [ ] Erik (or designated backup) has approved the certificate text if the request involved any escalation.

## Resolving MSA vs. DPA timeline disputes

The Master Services Agreement section 8.2 specifies a 30-day deletion timeline. The Data Processing Addendum specifies 7 business days. **The DPA controls.**

When a customer cites the 30-day MSA timeline:
1. Do not agree to the 30-day timeline.
2. Do not unilaterally commit to the 7-business-day timeline either.
3. Escalate the dispute to Erik Lindqvist (Legal) for sign-off before responding substantively.
4. Acknowledge receipt to the customer with neutral language (e.g., "We're reviewing the applicable contractual terms and will follow up shortly.").

## Export requests

- Customers can self-serve exports via the portal for any account they administer.
- Bulk exports larger than 50 GB must be routed through Erik for review before fulfillment.
- Export format is gzipped JSONL.

## Example responses

**Customer asks "Has my data been deleted yet?" on day 10:**
> Engineering completed deletion from production and warm storage on [date]. Encrypted backups containing your data will roll off over the following 90 days, after which we will issue your deletion certificate.

**Customer asks "Why isn't this done in 30 days per our MSA?":**
> Thank you for flagging this. We're reviewing the applicable contractual terms between the MSA and the Data Processing Addendum and will follow up with a definitive response. (Then escalate to Erik immediately.)

**Customer requests a 75 GB export:**
> Routed to Erik for review per the bulk export policy. Do not begin fulfillment until Erik approves.