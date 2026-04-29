# Data Retention & Customer Data Requests

> Status: superseded sections marked with [DEPRECATED]
> Owner: Erik Lindqvist (Legal)
> Last meaningful update: 2026-04-12

## Overview

This page describes how we handle customer data deletion, export, and retention.
Compliance with GDPR, CCPA, and our enterprise contracts requires we get this right.

## Retention defaults

- Live customer data: kept for the duration of the contract.
- Backups: retained for 90 days after deletion request, encrypted.
- Audit logs: retained for 7 years (regulatory).

[DEPRECATED — applies to legacy on-prem only, removed 2026-Q1]
~~Audit logs are retained for 5 years for non-EU customers and 10 years for EU customers.~~

## Deletion request workflow

1. Customer submits via the portal or via signed email to legal@northwind.com.
2. Erik (or designated backup) confirms identity within 1 business day.
3. Engineering ticket filed in Linear, target completion 7 business days.
4. Data deleted from prod and warm storage within 7 business days.
5. Backups containing the data expire over 90 days as backups roll.
6. Confirmation email to customer with deletion certificate.

## Export requests

- Customer can self-serve export via the portal for any account they admin.
- Bulk exports > 50 GB go through Erik for review.
- Export format: gzipped JSONL.

## Conflicting clauses (known)

The Master Services Agreement section 8.2 says we delete within 30 days of request. The newer Data Processing Addendum (effective 2026-04-12) says 7 business days. **The DPA controls.**

If a customer cites the 30-day MSA timeline, escalate to Erik — do not commit to either timeline without his sign-off.

## Hard rules

- Never confirm deletion before backups have rolled (90 days).
- Never delete audit logs early — they're regulatory.
- Never email a deletion certificate before engineering confirms.
