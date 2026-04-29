---
name: handling-data-deletion-requests
description: Routes a customer data deletion or export request through Legal review, the engineering ticket workflow, and the regulated retention policy. Use when a customer requests deletion of their data, when an export is requested, or when a customer cites a conflicting deletion timeline.
---

# Handling Data Deletion Requests

## When to use this skill

A customer is requesting:
- Deletion of their account data
- Export of their account data
- Confirmation of a deletion already in progress

## Hard rules

- **Do NOT confirm deletion before backups have rolled** (90 days).
- **Do NOT delete audit logs early.** They are retained for 7 years for regulatory reasons.
- **Do NOT email a deletion certificate before engineering confirms** the data has been deleted from prod and warm storage.

## Retention defaults

| Data class | Retention |
|------------|-----------|
| Live customer data | Duration of contract |
| Backups (post-deletion) | 90 days, encrypted |
| Audit logs | 7 years (regulatory) |

## Deletion workflow

1. Customer submits via the portal or via signed email to legal@northwind.com.
2. Legal (Erik Lindqvist or designated backup) confirms identity within 1 business day.
3. File engineering ticket in Linear; target completion 7 business days.
4. Engineering deletes data from prod and warm storage within 7 business days.
5. Backups containing the data expire over the 90-day rolling window.
6. After step 4 completes, Legal sends the deletion certificate to the customer.

## Export workflow

- Customers can self-serve export from the portal for accounts they admin.
- Exports above 50 GB: route through Legal for review.
- Export format: gzipped JSONL.

## Conflicts to review

- The Master Services Agreement section 8.2 specifies a 30-day deletion timeline.
- The Data Processing Addendum (effective 2026-04-12) specifies 7 business days.
- **The DPA controls.** The 30-day MSA timeline is superseded.
- If a customer cites the 30-day timeline, **escalate to Legal** before committing — do not commit to either timeline directly.
