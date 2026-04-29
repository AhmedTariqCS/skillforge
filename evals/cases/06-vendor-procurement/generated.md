---
name: handling-software-procurement
description: Guides software procurement decisions by enforcing approval thresholds, security requirements, vendor red-flag checks, and renewal handling. Use when evaluating, purchasing, or renewing any third-party software, SaaS subscription, or vendor contract, or when reviewing whether a tool meets procurement and security baseline requirements.
---

# Handling Software Procurement

## When to use this skill

Apply this skill whenever someone proposes buying new software, signing a vendor contract, expanding an existing subscription, or approaching a renewal date. It covers approval routing, mandatory security artifacts, disqualifying vendor traits, and renewal defaults.

## Hard rules

- DO NOT sign any software contract without a SOC 2 Type II report on file from the vendor.
- DO NOT sign any software contract until Legal (Erik Lindqvist) has executed a Data Processing Agreement.
- DO NOT purchase a tool that touches customer data unless it supports SSO via Okta.
- NEVER sign with a vendor that lacks a SOC 2 report (an "in progress" status without an auditor letter does not count).
- NEVER sign with a vendor whose enterprise tier does not offer SSO.
- NEVER sign with a vendor whose data residency falls outside the US, EU, or Canada.
- NEVER sign with a vendor that will not provide a subprocessor list.
- DO NOT allow contracts to auto-renew; the default action at renewal is to re-evaluate.
- DO NOT skip approval routing — the annual cost determines the required approver(s).

## Approval thresholds

Route every purchase to the approver(s) matching its total annual cost.

| Annual cost     | Required approver(s) |
|-----------------|----------------------|
| Under $1,200    | Manager              |
| $1,200 – $10k   | VP of function       |
| $10k – $50k     | CFO                  |
| Over $50k       | CFO **and** CEO      |

If a purchase sits on a boundary (for example, $10,000 exactly), escalate to the higher tier.

## Required artifacts for every purchase

Confirm all four items before signing, regardless of cost:

1. **SOC 2 Type II report** — request from the vendor before signing.
2. **Data Processing Agreement (DPA)** — executed by Legal (Erik Lindqvist).
3. **Okta SSO** — required for any tool that will touch customer data.
4. **Approval** — captured from the appropriate approver per the table above.

## Vendor evaluation workflow

1. Identify the annual cost and determine the approval tier.
2. Request the SOC 2 Type II report from the vendor.
3. Check for red flags (see below). If any are present, stop and decline the vendor.
4. Confirm SSO availability on the tier being purchased, especially if customer data is involved.
5. Send the DPA to Legal (Erik Lindqvist) for execution.
6. Obtain written approval from the required approver(s) for the cost tier.
7. Proceed with signature only after steps 1–6 are complete.

## Vendor red flags — do not sign

- [ ] No SOC 2, or only "in progress" without an auditor letter.
- [ ] No SSO available, even on the enterprise tier.
- [ ] Data residency outside US, EU, or Canada.
- [ ] Subprocessor list not provided on request.

Any single red flag disqualifies the vendor.

## Renewal handling

- Renewal alerts are sent in Slack 90 days before the renewal date via Vanta.
- The default action is **do not auto-renew**; treat each renewal as a fresh evaluation.
- Re-run the vendor evaluation workflow above for renewals.
- Any renewal over $10k must be reviewed by Procurement before proceeding.

## Examples

- **$800/year design plugin, no customer data:** Manager approval. SOC 2, DPA, and vendor inventory entry still required. Okta SSO is not strictly required because no customer data is touched, but is preferred.
- **$25,000/year analytics tool processing customer events:** CFO approval required. SOC 2 Type II, DPA via Erik Lindqvist, and Okta SSO are all mandatory. If the vendor's enterprise tier lacks SSO, decline.
- **$75,000/year platform contract:** CFO and CEO approval required. All four artifacts mandatory. Confirm data residency is US, EU, or Canada and obtain the subprocessor list before signing.
- **Existing $15k/year tool approaching renewal:** Vanta sends a Slack alert at 90 days. Procurement reviews because cost exceeds $10k. Do not allow auto-renewal; re-evaluate against current red-flag criteria before re-signing.