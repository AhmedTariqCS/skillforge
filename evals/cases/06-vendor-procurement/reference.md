---
name: buying-software
description: Routes a software purchase or renewal through the company's procurement gates, including SOC 2/DPA/SSO checks and the cost-based approval ladder. Use when an employee wants to buy or renew a SaaS tool, when reviewing a vendor proposal, or when a Vanta renewal alert fires.
---

# Buying Software

## When to use this skill

You are about to:
- Buy a new software tool
- Renew an existing subscription
- Review a vendor proposal

## Approval ladder

| Annual cost | Approver |
|-------------|----------|
| < $1,200 | Manager |
| $1,200–$10k | VP of function |
| $10k–$50k | CFO |
| > $50k | CFO + CEO |

## Hard rules — required for any purchase

- **SOC 2 Type II report on file** before signing. "In progress" is not acceptable without an auditor letter.
- **DPA executed by Legal** (Erik Lindqvist) before signing.
- **Listed in the vendor inventory** (Vanta).
- **SSO via Okta** — non-negotiable for tools touching customer data.

## Vendor red flags — do not sign

- No SOC 2 Type II.
- No SSO available even on the enterprise tier.
- Data residency outside US, EU, or Canada.
- Subprocessor list not provided.

## Renewals

- Vanta sends renewal alerts 90 days in advance.
- **Default action: do NOT auto-renew.** Re-evaluate every cycle.
- Procurement reviews any renewal above $10k.
