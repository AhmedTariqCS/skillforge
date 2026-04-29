import type { SourceDoc, DemoScenario } from "../types";

// Northwind — a fictional B2B customer support SaaS (~80 employees, Series A).
// The data below is what their company brain has ingested: the kind of scattered
// knowledge every real company has buried across Slack, Notion, GitHub, and Intercom.

export const NORTHWIND_DOCS: SourceDoc[] = [
  // ---------------------- NOTION ----------------------
  {
    id: "notion-refund-policy-v3",
    source: "notion",
    kind: "policy",
    title: "Refund Policy v3 (current)",
    url: "https://northwind.notion.site/refund-policy-v3",
    author: "Sarah Chen",
    authorRole: "VP Customer Success",
    createdAt: "2026-03-12T15:20:00Z",
    updatedAt: "2026-04-08T19:45:00Z",
    tags: ["cs", "policy", "refunds", "current"],
    body: `# Northwind Refund Policy v3

> This supersedes v2 (which capped refunds at \$5k regardless of plan).

## TL;DR

| Plan | Within 30 days | 30–90 days | After 90 days |
|------|----------------|------------|---------------|
| Starter | Full refund | Pro-rated refund | Service credit only |
| Growth | Full refund | Pro-rated refund | Service credit only |
| Enterprise | Full refund | Full refund | Pro-rated credit (max 6 months) |

## Authority matrix

- CSMs can approve refunds up to **\$2,500** without escalation.
- VP CS approves refunds **\$2,500–\$25,000**.
- CFO approval required for refunds **> \$25,000**.

## Required steps

1. Verify the plan tier and contract start date in Salesforce.
2. Confirm whether the request is product-quality-related (we are MORE generous) vs preference-related.
3. If product-quality: pull the relevant ticket / incident IDs as context.
4. Process via Stripe (refund) or NetSuite (credit memo) — never both.
5. Log the decision in the customer's account in Salesforce with template "RFND-2026".

## What NOT to do

- Do NOT promise refunds in writing before confirming approval. Use language like "I'll look into what we can do" until you've cleared it.
- Do NOT issue refunds for outages under our SLA — those go through the SLA credit process (separate doc).

## Escalation contact

Sarah Chen, sarah@northwind.com — primary
Maya Okafor, maya@northwind.com — backup when Sarah is OOO`,
  },
  {
    id: "notion-pricing-exceptions",
    source: "notion",
    kind: "policy",
    title: "Sales Discount & Pricing Exception Matrix",
    url: "https://northwind.notion.site/pricing-exceptions",
    author: "Maya Okafor",
    authorRole: "VP Revenue",
    createdAt: "2025-11-18T22:10:00Z",
    updatedAt: "2026-04-14T16:30:00Z",
    tags: ["sales", "pricing", "policy"],
    body: `# Sales Discount & Pricing Exception Matrix

## Standard discount ladder

- **< 25 seats:** No discount. List price only.
- **25–99 seats:** Up to **15%** AE-approved.
- **100–249 seats:** Up to **25%** AE-approved.
- **250+ seats:** Up to **30%** AE-approved; anything more requires VP Revenue.

## Multi-year boost

Add **+5%** for 2-year prepay, **+8%** for 3-year prepay. Stacks on the seat-tier discount above.

## Hard ceiling

**40% off list** is the floor. We do not go below that without CFO sign-off — it breaks our blended ARR model and gets flagged in the board deck.

## Exception process

1. AE submits exception request in Salesforce (template "DISC-EXC").
2. RevOps validates against the matrix within 4 business hours.
3. If above AE authority, ping #sales-ops with @here, tag Maya.
4. Maya responds with approve/reject + reasoning by EOD.

## Comparable deals (for reference)

- TechCorp (Mar 2026): 35% / 150 seats / 2-year prepay. Approved by Maya, justified by displacement of Zendesk.
- Acme Industries (Feb 2026): 32% / 200 seats / 1-year. Approved.
- Lumen Labs (Jan 2026): 38% / 80 seats / 3-year. **Rejected** — too aggressive at that seat count, came back at 28% and closed.

## Anti-patterns we've gotten burned on

- Verbal discount commitments before exception approval. **Always** route through Salesforce first.
- Discounting AND adding free seats. Pick one. Free seats above standard tier require separate approval.`,
  },
  {
    id: "notion-incident-runbook",
    source: "notion",
    kind: "runbook",
    title: "On-Call Incident Response — Engineering",
    url: "https://northwind.notion.site/oncall-runbook",
    author: "David Park",
    authorRole: "Staff SRE",
    createdAt: "2025-09-04T17:05:00Z",
    updatedAt: "2026-04-22T11:12:00Z",
    tags: ["eng", "sre", "runbook", "current"],
    body: `# On-Call Incident Response (Engineering)

## Severity definitions

- **SEV1**: Customer-facing outage, data loss, or security incident. Revenue impact.
- **SEV2**: Major degradation (>P95 latency 2x baseline, partial outage of one tier).
- **SEV3**: Minor or cosmetic. No customer impact.

## Initial response (first 5 minutes)

1. **Acknowledge** the page in PagerDuty.
2. **Open** an incident channel: #inc-YYYYMMDD-shortdesc.
3. **Post** the auto-generated incident card. Tag the affected service owner.
4. **Status page** for SEV1 only. Do not status-page SEV2 unless duration > 15 min.

## Don't restart pods on payments-svc

> **Hard rule.** Last incident (Feb 14, 2026) restarting payments-svc pods caused
> 30 minutes of dropped Stripe webhook retries. SRE approval required.
> See post-mortem PM-2026-02-14.

## Escalation tree

- **Payments / billing**: David Park (primary), Aisha Rahman (backup)
- **Auth / identity**: Marco Silva (primary), Jenny Liu (backup)
- **Database / Postgres**: David Park, then external (Neon support)
- **Frontend / CDN**: Jenny Liu

## Communication

- Internal: #inc-* channel + auto-summary every 30 min.
- External (SEV1 only): status page + targeted email to affected accounts (template in Intercom: "OUTAGE-NOTIFY-2026").
- DO NOT post to Twitter/LinkedIn. Comms team owns external. Loop in @comms-oncall.

## Post-mortem

Required for all SEV1 and SEV2. Use the post-mortem template in this Notion. Due within 72 hours of resolution. No-blame language only.`,
  },
  {
    id: "notion-csm-playbook",
    source: "notion",
    kind: "wiki",
    title: "CSM Operating Manual — Customer Health Scoring",
    url: "https://northwind.notion.site/csm-health-scoring",
    author: "Sarah Chen",
    authorRole: "VP Customer Success",
    createdAt: "2026-01-22T14:00:00Z",
    updatedAt: "2026-04-02T09:18:00Z",
    tags: ["cs", "playbook"],
    body: `# Customer Health Scoring (v2)

Health score is computed weekly. CSMs review the dashboard every Monday.

## Score components (100 total)

- **Usage (40 pts):** WAU/seat ratio, feature adoption depth, integration count.
- **Engagement (20 pts):** Last QBR date, Slack response rate, NPS trend.
- **Renewal signal (20 pts):** Days to renewal, executive sponsor change, expansion conversations.
- **Support load (20 pts):** Open ticket count, escalations in last 30 days.

## Color codes

- **Green (80+):** Renew, expand. Pursue case study + reference call ask.
- **Yellow (60–79):** Active CSM intervention. Schedule check-in within 14 days.
- **Red (< 60):** All-hands. Loop in VP CS + AE. Build save plan.

## Save play (Red accounts)

1. Within 48 hours: schedule exec sponsor call.
2. Within 1 week: present findings + commitment plan to customer.
3. Hold weekly check-ins for 6 weeks min.
4. If no improvement after 6 weeks, route to "managed offboarding" (separate doc).

## Cross-reference

- Renewal forecast accuracy is tracked in #cs-forecast.
- Expansion plays live in the AE/CSM joint playbook (Notion).`,
  },
  {
    id: "notion-procurement",
    source: "notion",
    kind: "policy",
    title: "How to buy software at Northwind",
    url: "https://northwind.notion.site/procurement",
    author: "Priya Shah",
    authorRole: "Head of Operations",
    createdAt: "2025-08-14T13:25:00Z",
    updatedAt: "2026-03-30T18:00:00Z",
    tags: ["ops", "procurement"],
    body: `# Software Procurement

## TL;DR

| Annual cost | Approver |
|-------------|----------|
| < \$1,200   | Manager |
| \$1,200–\$10k | VP of function |
| \$10k–\$50k | CFO |
| > \$50k     | CFO + CEO |

## Required for ANY purchase

1. SOC 2 Type II report on file (request from vendor before signing).
2. DPA executed by Legal (Erik Lindqvist).
3. Listed in our vendor inventory (Vanta).
4. SSO via Okta — non-negotiable for tools touching customer data.

## Vendor red flags (do not sign)

- No SOC 2 (or "in progress" without auditor letter).
- No SSO available even on enterprise tier.
- Data residency outside US/EU/Canada.
- Subprocessor list not provided.

## Renewals

- Slack notifications go out 90 days before renewal via Vanta.
- Default action: do NOT auto-renew. Re-evaluate.
- Procurement reviews any renewal > \$10k.`,
  },

  // ---------------------- SLACK ----------------------
  {
    id: "slack-cs-policies-2026-04-08",
    source: "slack",
    kind: "thread",
    title: "Refund cap update — Enterprise can now go beyond \$5k",
    url: "https://northwind.slack.com/archives/CSPOL/p1712601900",
    author: "Sarah Chen",
    authorRole: "VP Customer Success",
    channel: "#cs-policies",
    participants: ["Sarah Chen", "Maya Okafor", "Marco Silva", "Jenny Liu"],
    createdAt: "2026-04-08T19:45:00Z",
    updatedAt: "2026-04-09T14:22:00Z",
    tags: ["cs", "decision", "refunds"],
    body: `**Sarah Chen** [Apr 8, 3:45 PM]
Heads up team — I just published Refund Policy v3. The big change: we're removing the \$5k hard cap for Enterprise customers. After 90 days, Enterprise gets pro-rated credit up to 6 months. Within 90 days they get FULL refund, not just pro-rated.

**Sarah Chen**
This came out of the Q1 retention review. We were losing too many enterprise renewals because we were nickel-and-diming 6-month-in customers who had genuine product issues.

**Maya Okafor** [Apr 8, 4:01 PM]
:+1: from sales side. The TechCorp deal almost died over this exact thing.

**Marco Silva** [Apr 8, 4:12 PM]
For CSMs — what's the new approval threshold?

**Sarah Chen**
CSM up to \$2,500 unilaterally, me up to \$25k, CFO above. Same as before, just no plan cap.

**Jenny Liu** [Apr 9, 10:14 AM]
Ran this by Erik (legal) — he's good with it. Just make sure RFND-2026 SF template is updated, not RFND-2025.

**Sarah Chen** [Apr 9, 10:22 AM]
Updated. v3 is live in Notion. v2 is archived. Please do not reference v2 going forward.`,
  },
  {
    id: "slack-sales-ops-2026-03-14",
    source: "slack",
    kind: "thread",
    title: "TechCorp discount escalation — 35% / 150 seats / 2-year",
    url: "https://northwind.slack.com/archives/CSO/p1710436200",
    author: "Tom Reilly",
    authorRole: "AE",
    channel: "#sales-ops",
    participants: ["Tom Reilly", "Maya Okafor", "Sarah Chen"],
    createdAt: "2026-03-14T15:30:00Z",
    updatedAt: "2026-03-14T17:18:00Z",
    tags: ["sales", "exception", "approved"],
    body: `**Tom Reilly** [Mar 14, 11:30 AM]
@Maya Okafor — TechCorp wants 35% off for 150 seats, 2-year prepay. Per the matrix that's above my AE authority (max 25% + 5% multi-year boost = 30%). They're displacing Zendesk and our champion Pat is sticking her neck out internally. Verbal close target is Friday.

**Maya Okafor** [Mar 14, 12:45 PM]
What's the displacement evidence? If Pat can give us a written internal memo I'll fast-track.

**Tom Reilly** [Mar 14, 12:50 PM]
Got it. Pat sent the email yesterday — Zendesk's been their incumbent for 4 years, churning over feature gaps in routing.

**Maya Okafor** [Mar 14, 1:18 PM]
Approved. 35% / 150 / 2-year prepay. Conditions: must close by Mar 31 EOM and Pat agrees to a case study within 90 days of go-live. Document both in Salesforce DISC-EXC.

**Tom Reilly**
:fire: thank you. Closing tonight.

**Sarah Chen** [Mar 14, 1:22 PM]
@Tom can you also note any service-level commitments? I want to flag onboarding 150 seats inside 30 days requires CSM bandwidth — I'll need to allocate.`,
  },
  {
    id: "slack-payments-incident-2026-02-14",
    source: "slack",
    kind: "thread",
    title: "Payments-svc latency spike — Stripe webhook storm",
    url: "https://northwind.slack.com/archives/INC/p1707937200",
    author: "David Park",
    authorRole: "Staff SRE",
    channel: "#inc-20260214-payments",
    participants: ["David Park", "Aisha Rahman", "Marco Silva", "Sarah Chen"],
    createdAt: "2026-02-14T19:00:00Z",
    updatedAt: "2026-02-14T22:30:00Z",
    tags: ["incident", "post-mortem", "payments"],
    body: `**David Park** [Feb 14, 3:00 PM]
SEV2 declared. payments-svc P95 has been 4x baseline for last 12 min. Webhook queue depth at 14k.

**Aisha Rahman** [Feb 14, 3:04 PM]
Looking. Stripe just sent us a retry storm — they had a downstream issue at 2:48 and now their replay is hitting us hard.

**Marco Silva** [Feb 14, 3:08 PM]
Should we restart the pods to clear the queue?

**David Park** [Feb 14, 3:09 PM]
**NO.** Do not restart payments-svc pods. We'll lose in-flight webhook deliveries that Stripe has already marked acknowledged. Last time we did that we double-charged ~40 customers.

**David Park**
We need to scale out horizontally. I'm bumping the HPA max from 12 to 24. Already done. Should drain in ~8 minutes.

**Aisha Rahman** [Feb 14, 3:18 PM]
Queue depth dropping. P95 normalizing.

**David Park** [Feb 14, 3:32 PM]
Resolved. Total impact: P95 elevated for 32 min, no data loss, no double-charges. Will write up post-mortem PM-2026-02-14.

**Sarah Chen** [Feb 14, 6:30 PM]
@David — should I status-page this retroactively for the 2 enterprise accounts that asked?

**David Park**
No public status page for SEV2 under 60 min by policy. Targeted email to affected enterprise accounts only. Ping me their list and I'll generate the impact summary.`,
  },
  {
    id: "slack-eng-decision-react",
    source: "slack",
    kind: "decision",
    title: "Decision: standardizing on TanStack Query over SWR",
    url: "https://northwind.slack.com/archives/ENG/p1709142000",
    author: "Marco Silva",
    authorRole: "Eng Manager",
    channel: "#eng-discuss",
    participants: ["Marco Silva", "Jenny Liu", "Aisha Rahman", "David Park"],
    createdAt: "2026-02-28T17:00:00Z",
    updatedAt: "2026-02-28T20:11:00Z",
    tags: ["eng", "decision", "frontend"],
    body: `**Marco Silva** [Feb 28, 1:00 PM]
We've been mixing SWR and TanStack Query across the dashboard codebase. Time to standardize. Voting in the thread by EOD.

**Jenny Liu** [Feb 28, 1:14 PM]
TanStack Query, strongly. Better invalidation semantics, our backend caching story already assumes optimistic updates.

**Aisha Rahman** [Feb 28, 1:38 PM]
+1 TanStack. Plus our query keys map cleanly to our REST endpoint structure.

**Marco Silva** [Feb 28, 4:11 PM]
Decision: **TanStack Query** is the standard. Migration plan:
- New code uses TanStack Query.
- SWR-based code stays until next refactor of that surface.
- No mixing within a single feature.
Doc updated in Eng Wiki "Frontend Standards".`,
  },
  {
    id: "slack-comms-pr-policy",
    source: "slack",
    kind: "thread",
    title: "External comms — who can talk to press",
    url: "https://northwind.slack.com/archives/COMMS/p1706659200",
    author: "Priya Shah",
    authorRole: "Head of Operations",
    channel: "#comms",
    participants: ["Priya Shah", "Marco Silva", "David Park"],
    createdAt: "2026-01-31T00:00:00Z",
    updatedAt: "2026-01-31T03:15:00Z",
    tags: ["comms", "policy"],
    body: `**Priya Shah** [Jan 30, 7:00 PM]
Reminder for the team: TechCrunch reached out about our Series A. Please do NOT respond directly to press inquiries. Forward all of them to me or to ceo@northwind.com.

**Marco Silva** [Jan 30, 7:32 PM]
Does this include LinkedIn DMs from journalists?

**Priya Shah**
Yes. Anything that smells like press → forward to me. We'll triage and decide if/how to engage.

**David Park** [Jan 30, 9:15 PM]
Same for analyst inquiries (Forrester / G2 / etc.)?

**Priya Shah**
Yes — analyst relations also goes through me + the CEO.`,
  },
  {
    id: "slack-cs-discount-comp",
    source: "slack",
    kind: "thread",
    title: "Lumen Labs — discount ask was rejected at 38%, came back at 28%",
    url: "https://northwind.slack.com/archives/CSO/p1705680000",
    author: "Tom Reilly",
    authorRole: "AE",
    channel: "#sales-ops",
    participants: ["Tom Reilly", "Maya Okafor"],
    createdAt: "2026-01-19T20:00:00Z",
    updatedAt: "2026-01-22T15:48:00Z",
    tags: ["sales", "exception", "rejected"],
    body: `**Tom Reilly** [Jan 19, 4:00 PM]
Lumen Labs is asking for 38% off / 80 seats / 3-year prepay. Per matrix that's well above what I can do (max 23% at that seat count + 8% multi-year = 31%). Asking for the exception.

**Maya Okafor** [Jan 19, 5:30 PM]
**Rejected.** 38% on 80 seats sets a bad precedent — we'd have to extend it down-market. Counter at 28% with ramp pricing (year 1 reduced seat count, year 2 full).

**Tom Reilly** [Jan 22, 11:48 AM]
They came back at 28% / 80 seats / 3-year. Closed today.

**Maya Okafor**
:tada: nice work. Documenting in pricing exceptions doc.`,
  },
  {
    id: "slack-hiring-loop",
    source: "slack",
    kind: "thread",
    title: "Engineering hiring loop — required steps",
    url: "https://northwind.slack.com/archives/HIRING/p1704067200",
    author: "Marco Silva",
    authorRole: "Eng Manager",
    channel: "#hiring",
    participants: ["Marco Silva", "Jenny Liu", "Priya Shah"],
    createdAt: "2025-12-31T20:00:00Z",
    updatedAt: "2025-12-31T22:30:00Z",
    tags: ["hiring", "eng", "policy"],
    body: `**Marco Silva** [Dec 31, 3:00 PM]
For 2026 we're standardizing the eng loop:

1. Recruiter screen (30 min) — Priya
2. Hiring manager intro (45 min)
3. Take-home (4 hr cap, paid \$200 for senior+ roles)
4. Onsite — 4 sessions, 1 day:
   - Coding pair (90 min)
   - System design (60 min, senior+ only)
   - Cross-functional / behavioral (45 min)
   - Founder chat (30 min, leveling)
5. Debrief same day, decision within 48 hours.

**Marco Silva**
Hard rule: no candidate skips take-home. No exceptions even for ex-FAANG referrals. We've been burned twice.

**Jenny Liu** [Dec 31, 4:55 PM]
Loop length needs to be < 14 days from screen to offer. Lost two candidates last year because we dragged.

**Priya Shah** [Dec 31, 5:30 PM]
Documented in Notion → Hiring → Eng Loop 2026. Will share scorecard template tomorrow.`,
  },

  // ---------------------- INTERCOM (Support tickets) ----------------------
  {
    id: "intercom-ticket-4521",
    source: "intercom",
    kind: "ticket",
    title: "TICK-4521: Acme Industries — Stripe webhook delivery delays",
    url: "https://northwind.intercom.com/inbox/ticket/4521",
    author: "Aisha Rahman",
    authorRole: "Support Engineer",
    createdAt: "2026-04-19T16:42:00Z",
    updatedAt: "2026-04-22T11:00:00Z",
    tags: ["support", "open", "payments"],
    body: `**Customer:** Acme Industries (Enterprise, Sarah Chen owns)
**Status:** In progress — eng investigating
**Priority:** P2
**Assigned to:** Marco Silva (eng), Aisha (support)

## Issue

Acme is reporting that Stripe webhooks are arriving 3–5 minutes after the corresponding charge event. They're using us as the system of record for revenue ops and the lag is breaking their dashboards.

## Investigation so far

- 2026-04-19: Reproduced. We see ~4 min P95 webhook-to-DB write latency for Acme specifically.
- 2026-04-20: Marco found the issue — Acme's webhook URL is on a shared dispatcher pool that's currently under-provisioned. They're hitting our queue's tail latency.
- 2026-04-22: Mitigation in progress — moving Acme to a dedicated dispatcher tier. ETA: end of this sprint (next week).

## Customer ask

Acme is asking for a service credit for Q2 due to the impact. Sarah Chen is reviewing per refund policy v3. Likely outcome: 1-month credit, given product-quality cause.`,
  },
  {
    id: "intercom-ticket-4488",
    source: "intercom",
    kind: "ticket",
    title: "TICK-4488: Lumen Labs — wants refund 6 months into contract",
    url: "https://northwind.intercom.com/inbox/ticket/4488",
    author: "Sarah Chen",
    authorRole: "VP Customer Success",
    createdAt: "2026-04-15T18:00:00Z",
    updatedAt: "2026-04-21T13:30:00Z",
    tags: ["support", "refund", "enterprise"],
    body: `**Customer:** Lumen Labs (Enterprise, signed Jan 2026)
**Status:** Resolved — credit issued
**Decision:** 6-month credit (\$48k) per policy v3

## Customer message (paraphrased)

"We've been on Northwind for 6 months. The new routing engine doesn't handle our use case well — we built around v1 and the v2 migration broke our workflows. We want a full refund."

## Resolution

Per Refund Policy v3 (Sarah Chen, current):
- Plan: Enterprise
- Time: 6 months in (>90 days)
- Outcome: Pro-rated credit, max 6 months. NOT a refund — that window closed.

Approved 6 months of service credit (\$48k) given partial product-quality cause (v2 migration was rougher than expected for their use case).

Credit memo issued via NetSuite, logged in SF as RFND-2026.

Customer accepted. Renewal conversation scheduled for Aug 2026.`,
  },
  {
    id: "intercom-ticket-4602",
    source: "intercom",
    kind: "ticket",
    title: "TICK-4602: Globex — SSO config not working",
    url: "https://northwind.intercom.com/inbox/ticket/4602",
    author: "Aisha Rahman",
    authorRole: "Support Engineer",
    createdAt: "2026-04-25T14:15:00Z",
    updatedAt: "2026-04-25T17:30:00Z",
    tags: ["support", "resolved", "auth"],
    body: `**Customer:** Globex (Growth tier, Tom Reilly owns)
**Status:** Resolved — config issue on customer side

Globex's IT configured the SAML response without the NameID format we require (urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress).

Sent them the config guide link, walked through Okta setup on a 30-min call. SSO working as of 1pm.

Closed.`,
  },
  {
    id: "intercom-ticket-4471",
    source: "intercom",
    kind: "ticket",
    title: "TICK-4471: Pied Piper — wants 50 free seats",
    url: "https://northwind.intercom.com/inbox/ticket/4471",
    author: "Tom Reilly",
    authorRole: "AE",
    createdAt: "2026-04-12T19:00:00Z",
    updatedAt: "2026-04-12T22:15:00Z",
    tags: ["sales", "denied"],
    body: `**Customer:** Pied Piper (prospect, no contract yet)

Asked for 50 free seats on top of a 200-seat purchase. Per Maya's anti-pattern doc: we don't stack discounts AND free seats. Counter-offered: 30% discount or 30 free seats, not both.

They picked the 30% discount. Closed at \$240k ARR.`,
  },

  // ---------------------- GITHUB ----------------------
  {
    id: "github-pm-2026-02-14",
    source: "github",
    kind: "post-mortem",
    title: "PM-2026-02-14: payments-svc Stripe webhook retry storm",
    url: "https://github.com/northwind/runbooks/blob/main/post-mortems/2026-02-14.md",
    author: "David Park",
    authorRole: "Staff SRE",
    createdAt: "2026-02-17T19:30:00Z",
    updatedAt: "2026-02-17T19:30:00Z",
    tags: ["post-mortem", "incident", "payments"],
    body: `# PM-2026-02-14: payments-svc Stripe webhook retry storm

**Severity:** SEV2
**Duration:** 32 minutes (3:00 PM – 3:32 PM PT)
**Customer impact:** P95 latency 4x baseline for payments-related operations. No data loss. No double-charges.

## Timeline

- **2:48 PM** — Stripe internal incident (per their status page).
- **3:00 PM** — Their replay traffic hits our webhook endpoint. Queue depth balloons from <100 to 14k in ~12 min. PagerDuty fires.
- **3:04 PM** — David ack'd. Aisha joined.
- **3:08 PM** — Marco proposed pod restart. **Rejected** by David — that's how we caused the Apr 2025 double-charge incident.
- **3:09 PM** — David bumps payments-svc HPA max from 12 to 24.
- **3:18 PM** — Queue draining. P95 normalizing.
- **3:32 PM** — Resolved.

## Root cause

Our HPA was tuned for steady-state load, not retry storms. We had 12 pods and the queue work-stealing pattern saturates around 800 webhooks/sec/pod. Stripe sent us ~1100/sec sustained for ~12 min.

## What went well

- David caught the pod-restart proposal before it shipped. **This saved us from a customer-impacting incident.**
- HPA bump applied cleanly, drain was orderly.

## What didn't

- Our HPA max was too low. Should be tuned for 4x baseline, not 1.5x.
- Our runbook didn't have a "what to do on a retry storm" section — just generic latency.

## Action items

- [x] Bump payments-svc HPA max to 32 (David, done 2026-02-15).
- [x] Add "retry storm" section to incident runbook (David, done 2026-02-17).
- [ ] Implement PagerDuty alert for queue depth > 5k (Aisha, due 2026-03-01).
- [x] Codify "do not restart payments-svc pods" as a runbook hard rule (David, done 2026-02-17).

## Lessons

- **Hard rule:** Do NOT restart payments-svc pods to clear queue depth. Scale out instead.
- **Hard rule:** Anything > 5k queue depth → page on-call.`,
  },
  {
    id: "github-pm-2025-04-15",
    source: "github",
    kind: "post-mortem",
    title: "PM-2025-04-15: payments-svc pod restart caused 40 double-charges",
    url: "https://github.com/northwind/runbooks/blob/main/post-mortems/2025-04-15.md",
    author: "David Park",
    authorRole: "Staff SRE",
    createdAt: "2025-04-18T16:00:00Z",
    updatedAt: "2025-04-18T16:00:00Z",
    tags: ["post-mortem", "incident", "payments", "historical"],
    body: `# PM-2025-04-15: payments-svc pod restart double-charge incident

**Severity:** SEV1
**Duration:** 45 min until detected; ~2 hours customer impact for affected accounts.
**Customer impact:** 40 customers double-charged. ~\$28k refunded. Trust damage.

## Summary

During a routine queue-depth spike, on-call (Marco at the time) restarted the payments-svc deployment to clear the queue. Stripe had already received ack for ~40 webhooks that the new pods then re-processed, causing duplicate charges.

## Lessons (codified in runbook)

- **Never restart payments-svc pods to clear backpressure.** Scale out.
- Idempotency keys on webhook handlers — implemented post-incident.
- Queue depth alerting thresholds.

This is the canonical "why we don't restart payments pods" reference. Junior engineers may not know this — please include in onboarding.`,
  },
  {
    id: "github-issue-routing-engine",
    source: "github",
    kind: "spec",
    title: "Routing Engine v2 migration spec",
    url: "https://github.com/northwind/server/issues/2871",
    author: "Jenny Liu",
    authorRole: "Senior Engineer",
    createdAt: "2025-12-08T19:00:00Z",
    updatedAt: "2026-02-04T14:30:00Z",
    tags: ["eng", "spec", "shipped"],
    body: `# Routing Engine v2

## Why

Routing v1 (rule-based DAG) doesn't handle:
- Multi-team round-robin with skill weighting.
- Time-zone aware on-call rotation for support escalation.
- "Sticky" assignment within a 24-hour window.

## Migration

- v2 ships behind \`feature.routing_v2\` per-tenant flag.
- Default OFF for existing customers, ON for new sign-ups.
- Migration tool: \`bin/migrate_routing.ts <tenant_id>\`.

## Known breaking changes

- v1 "fallback chain" semantics differ from v2 "escalation tree" (more strict).
- Some Lumen Labs–style custom routing rules don't have a 1:1 v2 mapping. We worked with their CSM to redesign.

## Status

- Shipped 2026-02-01 (Jenny + Aisha)
- Default-on rolled to all new tenants.
- Existing tenants migrated case-by-case via CSM.`,
  },
];

// ---------- DEMO SCENARIOS ----------

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "scenario-refund",
    title: "Refund decision: 6-month-in Enterprise customer",
    persona: "CSM (junior)",
    prompt:
      "A customer on the Enterprise plan, signed 6 months ago, is asking for a full refund because they had bugs early on. What do I do?",
    relevantSkills: ["handling-refund-requests", "logging-customer-decisions"],
    expectedFacts: [
      "notion-refund-policy-v3",
      "slack-cs-policies-2026-04-08",
      "intercom-ticket-4488",
    ],
  },
  {
    id: "scenario-pricing",
    title: "Pricing exception: 35% on 150-seat 2-year prepay",
    persona: "AE",
    prompt:
      "Prospect wants 35% off list, 150 seats, 2-year prepay. Can I approve, and if not, what do I do?",
    relevantSkills: ["approving-pricing-exceptions"],
    expectedFacts: [
      "notion-pricing-exceptions",
      "slack-sales-ops-2026-03-14",
      "slack-cs-discount-comp",
    ],
  },
  {
    id: "scenario-incident",
    title: "Incident response: payments-svc latency spike",
    persona: "Engineer (on-call)",
    prompt:
      "Payments-svc P95 is 4x baseline. Webhook queue depth is climbing fast. What do I do?",
    relevantSkills: ["responding-to-payment-incidents"],
    expectedFacts: [
      "notion-incident-runbook",
      "slack-payments-incident-2026-02-14",
      "github-pm-2026-02-14",
      "github-pm-2025-04-15",
    ],
  },
];

export const NORTHWIND_INFO = {
  name: "Northwind",
  description:
    "B2B customer support SaaS, 80 employees, Series A, headquartered in San Francisco.",
  // Stats shown in the dashboard
  stats: {
    documents: NORTHWIND_DOCS.length,
    sources: 4, // notion, slack, intercom, github
    factsExtracted: 47,
    skillsGenerated: 9,
    lastSync: "2 minutes ago",
  },
};

// Sources summary for the dashboard
export const NORTHWIND_SOURCES = [
  {
    type: "notion" as const,
    name: "Northwind Wiki",
    docCount: NORTHWIND_DOCS.filter((d) => d.source === "notion").length,
    status: "synced" as const,
    lastSync: "2 minutes ago",
  },
  {
    type: "slack" as const,
    name: "northwind.slack.com",
    docCount: NORTHWIND_DOCS.filter((d) => d.source === "slack").length,
    status: "synced" as const,
    lastSync: "30 seconds ago",
  },
  {
    type: "intercom" as const,
    name: "Support Tickets",
    docCount: NORTHWIND_DOCS.filter((d) => d.source === "intercom").length,
    status: "synced" as const,
    lastSync: "5 minutes ago",
  },
  {
    type: "github" as const,
    name: "northwind/runbooks",
    docCount: NORTHWIND_DOCS.filter((d) => d.source === "github").length,
    status: "synced" as const,
    lastSync: "12 minutes ago",
  },
];
