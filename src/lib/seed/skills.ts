import type { AgentSkill } from "../types";

// These are the SKILL.md files Skillforge generated from Northwind's data.
// Each skill is a Claude Agent Skills format file that an agent can load
// via the API or filesystem and execute. They follow Anthropic's published
// skill authoring best practices: gerund-form names, third-person descriptions,
// progressive disclosure with reference files, no time-sensitive language,
// concrete examples.

export const NORTHWIND_SKILLS: AgentSkill[] = [
  {
    name: "handling-refund-requests",
    description:
      "Decides whether a customer is eligible for a refund and which approval path to follow, based on Northwind's current refund policy. Use when a customer requests a refund, plan downgrade with money back, or service credit, or when a CSM is drafting a response to a refund request. Always cites the policy version and required Salesforce template.",
    topic: "refunds",
    factIds: [
      "fact-refund-policy-v3",
      "fact-refund-authority",
      "fact-refund-template",
    ],
    lastUpdatedAt: "2026-04-09T10:22:00Z",
    body: `# Handling Refund Requests

This skill encodes Northwind's **current refund policy (v3)** authored by Sarah Chen, VP CS. It supersedes v2.

## When to use this skill

A customer (or a CSM acting on behalf of one) is asking for:
- Money back on a current or recent purchase
- A pro-rated refund / credit for unused time
- A service credit for product-quality issues
- A "we're not happy" exit during the contract

If the request is about an SLA breach (downtime), use \`handling-sla-credits\` instead — those have a different process.

## Decision workflow

Copy this checklist and check items as you complete them:

\`\`\`
Refund Progress:
- [ ] Step 1: Pull plan tier and contract start date from Salesforce
- [ ] Step 2: Determine the refund window (within 30d / 30–90d / >90d)
- [ ] Step 3: Determine if the cause is product-quality or preference
- [ ] Step 4: Determine the dollar amount and pick the approver
- [ ] Step 5: Draft the response (do NOT promise the refund yet)
- [ ] Step 6: Get approval, then issue refund or credit
- [ ] Step 7: Log in Salesforce with template RFND-2026
\`\`\`

## Policy table

| Plan | Within 30 days | 30–90 days | After 90 days |
|------|----------------|------------|---------------|
| Starter | Full refund | Pro-rated refund | Service credit only |
| Growth | Full refund | Pro-rated refund | Service credit only |
| Enterprise | Full refund | Full refund | Pro-rated credit (max 6 months) |

## Authority matrix

| Amount | Approver |
|--------|----------|
| Up to \$2,500 | CSM (no escalation needed) |
| \$2,500 – \$25,000 | VP Customer Success (Sarah Chen) |
| Above \$25,000 | CFO sign-off required |

## Drafting the response

**Do NOT** commit to a refund in writing before approval lands. Use language like:

> "Thanks for sharing this — I want to make sure we get to the right outcome for you. Let me look at your account history and what we can do, and I'll come back to you with a clear answer within one business day."

**Once approved**, use this template:

> "Based on your contract (Plan: [TIER], started [DATE]) and our refund policy, we can offer you [REFUND or CREDIT AMOUNT]. [If credit:] This will appear as a credit memo on your next invoice. [If refund:] This will hit your card on file within 5–10 business days. I've logged this in your account."

## Issuing the refund

- **Cash refund:** Stripe (refund), reference the original charge ID.
- **Service credit:** NetSuite (credit memo against the customer), do NOT also issue a Stripe refund.
- Salesforce template: **RFND-2026** (do not use RFND-2025; that's archived).

## Examples

### Example 1: Enterprise customer, 6 months in, mixed cause

**Request:** "We've been on Northwind for 6 months. The v2 routing migration broke our workflows. We want a full refund."

**Decision:**
- Plan: Enterprise. Time: > 90 days. → Pro-rated credit only, max 6 months.
- Cause: partial product-quality (v2 migration). Generous interpretation appropriate.
- Amount: 6 months credit (maximum allowed).
- Approver: VP CS (since amount is likely > \$2,500).

**Reference:** This was the actual decision in TICK-4488 (Lumen Labs, Apr 2026). Outcome: \$48k credit issued, customer accepted, renewal conversation booked for Aug.

### Example 2: Starter plan, 14 days in, no specific issue

**Request:** "I changed my mind, can I get a refund?"

**Decision:**
- Plan: Starter. Time: < 30 days. → Full refund eligible.
- Cause: preference. Eligible but routine.
- Amount: full charge to date. Likely under \$2,500.
- Approver: CSM unilateral.

## What NOT to do

- Do not reference Refund Policy v2. It is archived. v3 is current as of April 2026.
- Do not issue both a Stripe refund AND a NetSuite credit. Pick one.
- Do not promise a refund in customer-facing writing before approval.
- Do not handle SLA-breach credits through this skill — that's a separate process.

## Sources

- Refund Policy v3 — Notion (Sarah Chen, last updated 2026-04-08)
- #cs-policies announcement thread — Slack (2026-04-08)
- TICK-4488 worked example — Intercom (Lumen Labs, Apr 2026)`,
  },

  {
    name: "approving-pricing-exceptions",
    description:
      "Determines whether a proposed sales discount is within the AE's authority, and routes exceptions through the correct approval path. Use when an AE drafts a discount, when a customer requests pricing concessions, or when reviewing a deal that exceeds standard discount tiers. Cites comparable approved deals and known anti-patterns.",
    topic: "pricing",
    factIds: [
      "fact-discount-ladder",
      "fact-multiyear-boost",
      "fact-discount-floor",
      "fact-disc-approved-techcorp",
      "fact-disc-rejected-lumen",
    ],
    lastUpdatedAt: "2026-04-14T16:30:00Z",
    body: `# Approving Pricing Exceptions

This skill encodes Northwind's discount matrix and the lessons from the past year of approved/rejected exceptions.

## When to use this skill

- An AE is drafting a deal with a discount.
- A prospect is asking for pricing concessions.
- A renewal includes a discount ask.

## Step-by-step

\`\`\`
Pricing Decision Progress:
- [ ] Step 1: Identify seat count and contract length
- [ ] Step 2: Compute the AE-authorized maximum (ladder + multi-year boost)
- [ ] Step 3: If proposed discount ≤ max: AE can approve; document and proceed
- [ ] Step 4: If above max: gather displacement / strategic justification
- [ ] Step 5: Submit exception via Salesforce DISC-EXC; ping #sales-ops
- [ ] Step 6: Wait for VP Revenue (Maya) decision before committing in writing
\`\`\`

## Standard discount ladder (AE authority)

| Seat count | Max % off list |
|------------|----------------|
| < 25       | 0% (list price only) |
| 25–99      | 15% |
| 100–249    | 25% |
| 250+       | 30% |

## Multi-year boost (additive)

- 2-year prepay: **+5%**
- 3-year prepay: **+8%**

These stack on the seat-tier discount above. Example: 100 seats with 2-year prepay = 25% + 5% = **30% AE-authorized max**.

## Hard floor

**40% off list is the floor.** No deal goes below 40% without CFO sign-off — it breaks the blended ARR model and shows up in the board deck.

## Comparable deals (use as reference)

| Customer | Seats | Term | Discount | Outcome | Justification |
|----------|-------|------|----------|---------|---------------|
| TechCorp | 150 | 2yr prepay | 35% | **Approved** (Maya, Mar 2026) | Displacing Zendesk; written internal memo from champion |
| Acme Industries | 200 | 1yr | 32% | **Approved** (Feb 2026) | Standard expansion |
| Lumen Labs | 80 | 3yr prepay | 38% → 28% | **Initial reject, closed at 28%** (Jan 2026) | Too aggressive at that seat count; ramp pricing instead |
| Pied Piper | 200 | 1yr | 30% (no free seats) | **Approved with counter** (Apr 2026) | They asked for discount + 50 free seats; we don't stack |

## When you need an exception

If the proposed discount exceeds AE authority:

1. Document the strategic justification: displacement, internal memo, expansion potential, or competitive context.
2. Submit Salesforce DISC-EXC with: ARR, seat count, term, requested discount, justification, comparable deals.
3. Post in #sales-ops with @here, tag @Maya.
4. Maya responds with approve/reject + reasoning by EOD.

## Anti-patterns (do not do)

- **Verbal commitment before Salesforce approval.** Always route through DISC-EXC first.
- **Stacking discount + free seats above tier.** Pick one. Free seats above standard tier require separate approval.
- **Discount-by-renewal.** A one-time exception should not become a renewal floor — renegotiate explicitly each cycle.

## Examples

### Example 1: 35% / 150 seats / 2-year prepay

- AE max at 150 seats + 2-year = 25% + 5% = 30%. **Above authority** at 35%.
- Path: file DISC-EXC, justify with displacement + champion memo, ping Maya.
- Reference: TechCorp Mar 2026 — exact same parameters, approved.

### Example 2: 22% / 60 seats / 1-year

- AE max at 60 seats + 1-year = 15% + 0% = 15%. **Above authority** at 22%.
- Path: file DISC-EXC. Justification: standard expansion likely insufficient — Maya may push back.

### Example 3: 28% / 80 seats / 3-year prepay

- AE max at 80 seats + 3-year = 15% + 8% = 23%. Slightly above authority at 28%.
- Path: file DISC-EXC. Reference: Lumen Labs (Jan 2026) — same parameters, was the COUNTER offer to a 38% ask. Likely approved.

## Sources

- Sales Discount & Pricing Exception Matrix — Notion (Maya Okafor, last updated 2026-04-14)
- #sales-ops threads — Slack (TechCorp Mar 2026, Lumen Jan 2026, Pied Piper Apr 2026)`,
  },

  {
    name: "responding-to-payment-incidents",
    description:
      "Diagnoses payment service incidents and chooses safe mitigations consistent with Northwind's hard rules learned from past post-mortems. Use when payments-svc is degraded, the Stripe webhook queue is backing up, or any on-call situation involving payment processing. Prevents the pod-restart anti-pattern that caused the April 2025 double-charge incident.",
    topic: "incidents",
    factIds: [
      "fact-incident-severity",
      "fact-no-pod-restart-payments",
      "fact-payments-escalation",
      "fact-payments-hpa",
    ],
    lastUpdatedAt: "2026-04-22T11:12:00Z",
    body: `# Responding to Payment Incidents

This skill encodes Northwind's hard-won rules for handling payments-svc incidents. It exists because in April 2025 we caused a customer-facing double-charge incident by doing the obvious-but-wrong thing.

## When to use this skill

You are on-call (or assisting on-call) and:
- payments-svc P95 is elevated.
- Stripe webhook queue depth is climbing.
- Charges or refunds are failing or duplicating.
- PagerDuty fired a payments-related alert.

## The hard rule (read first)

> **Do NOT restart payments-svc pods to clear queue depth or relieve latency.**
> Stripe has already received ack for in-flight webhooks. Restarting causes
> the new pods to re-process them, leading to duplicate charges.

This caused PM-2025-04-15 (40 customers double-charged, ~\$28k in refunds, trust damage). It is the canonical reference for this rule. Every junior engineer should be told this on day one.

**Instead:** scale out horizontally (bump HPA max). Stripe's retry behavior tolerates delay; it does not tolerate duplicate processing.

## Severity decision

- **SEV1**: Customer-facing outage of payment processing, data loss, security incident.
- **SEV2**: Latency 2x baseline+, partial degradation. Most queue-backup events.
- **SEV3**: Cosmetic. No customer impact.

A retry storm is **almost always SEV2**. Don't over-declare; don't under-declare.

## Initial response (first 5 minutes)

\`\`\`
Incident Response Progress:
- [ ] Step 1: Acknowledge the page in PagerDuty
- [ ] Step 2: Open #inc-YYYYMMDD-shortdesc channel
- [ ] Step 3: Post the auto-incident card and tag service owner
- [ ] Step 4: Read this skill (you're doing that now)
- [ ] Step 5: Determine severity and act
- [ ] Step 6: Status page only if SEV1 (or SEV2 > 60 min)
- [ ] Step 7: Resolve, then write post-mortem within 72 hours
\`\`\`

## Diagnostic flow

1. **Open the payments-svc Datadog dashboard** (or your equivalent — link from runbook page).
2. **Check upstream**: Stripe status page. If Stripe is having an incident, expect retry storms during their recovery.
3. **Check queue depth**: If > 5,000 → page on-call (auto-alerted). If > 14,000 → SEV2.
4. **Check P95 latency**: If 4x baseline sustained > 5 min → SEV2.

## Mitigation options

| Symptom | Action | DO NOT |
|---------|--------|--------|
| Queue depth climbing during Stripe replay | Bump HPA max (currently 32, can push to 48 in emergency) | Restart pods |
| Single pod misbehaving (OOM, stuck) | Scale that pod via deployment, drain gracefully | Mass-restart |
| Database contention | Page DB on-call (David Park) | Restart payments-svc pods to "reset" |
| In-flight webhook duplication | This shouldn't happen — idempotency keys are mandatory | Try to "fix" by restarting |

## Escalation tree

| Domain | Primary | Backup |
|--------|---------|--------|
| Payments / billing | David Park | Aisha Rahman |
| Auth / identity | Marco Silva | Jenny Liu |
| Database / Postgres | David Park | external (Neon support) |
| Frontend / CDN | Jenny Liu | (none) |

## Communication

- **Internal**: #inc-* channel + auto-summary every 30 min.
- **External (SEV1 only)**: status page + targeted email via Intercom template OUTAGE-NOTIFY-2026.
- **Do NOT post** to Twitter / LinkedIn. Comms team owns external — loop in @comms-oncall via Slack.

## After resolution

1. Post resolution in #inc-* channel.
2. **Required for SEV1 and SEV2**: write a post-mortem within 72 hours.
3. Use the Notion post-mortem template. No-blame language only.
4. Action items go in GitHub. Owner assigned. Due date set.

## Reference incidents

- **PM-2026-02-14** — Stripe retry storm. 32 min, SEV2, no impact. Action: HPA bumped 12 → 32. **Codified the no-restart rule.**
- **PM-2025-04-15** — Pod restart double-charge. 45 min undetected, ~2 hr customer impact, 40 double-charges, ~\$28k refunds. **Why we have the no-restart rule.**

## Sources

- On-Call Incident Response — Notion runbook (David Park, current)
- PM-2025-04-15 — GitHub post-mortem (canonical reference)
- PM-2026-02-14 — GitHub post-mortem (most recent)
- #inc-20260214-payments — Slack incident channel`,
  },

  // Supporting skills (shorter — populate the dashboard)

  {
    name: "scoring-customer-health",
    description:
      "Computes a customer health score across usage, engagement, renewal signals, and support load, and decides which save-play tier (green/yellow/red) applies. Use during weekly CSM dashboard reviews, before QBRs, or when a CSM needs to triage a churning account.",
    topic: "customer-success",
    factIds: ["fact-health-scoring"],
    lastUpdatedAt: "2026-04-02T09:18:00Z",
    body: `# Scoring Customer Health

Health = Usage (40) + Engagement (20) + Renewal signal (20) + Support load (20). Reviewed weekly Monday morning.

## Tiers

- **Green (80+):** Pursue case study + reference call ask.
- **Yellow (60–79):** Schedule check-in within 14 days.
- **Red (< 60):** All-hands save plan with VP CS + AE.

## Save play (Red)

1. **Within 48 hours:** schedule exec sponsor call.
2. **Within 1 week:** present findings + commitment plan.
3. **Hold weekly check-ins for 6 weeks min.**
4. If no improvement after 6 weeks: route to managed offboarding.

## Source

CSM Operating Manual — Notion (Sarah Chen).`,
  },

  {
    name: "buying-software",
    description:
      "Routes a software purchase request through Northwind's procurement gates, including required SOC 2/DPA/SSO checks and the cost-based approval ladder. Use when an employee wants to buy or renew a SaaS tool, when reviewing a vendor proposal, or when checking renewals.",
    topic: "procurement",
    factIds: ["fact-procurement-thresholds", "fact-procurement-redflags"],
    lastUpdatedAt: "2026-03-30T18:00:00Z",
    body: `# Buying Software at Northwind

## Approval ladder

| Annual cost | Approver |
|-------------|----------|
| < \$1,200   | Manager |
| \$1,200–\$10k | VP of function |
| \$10k–\$50k | CFO |
| > \$50k     | CFO + CEO |

## Required for ANY purchase

1. **SOC 2 Type II** report on file before signing.
2. **DPA** executed by Legal (Erik Lindqvist).
3. Listed in vendor inventory (Vanta).
4. **SSO via Okta** — non-negotiable for tools touching customer data.

## Vendor red flags (do not sign)

- No SOC 2 (or "in progress" without auditor letter).
- No SSO available even on enterprise tier.
- Data residency outside US/EU/Canada.
- Subprocessor list not provided.

## Renewals

- Vanta sends 90-day notification.
- Default action is **NOT** auto-renew.
- Procurement reviews renewals > \$10k.

## Source

Procurement policy — Notion (Priya Shah).`,
  },

  {
    name: "running-engineering-loop",
    description:
      "Runs a candidate through Northwind's engineering interview loop with required steps, takes-home rules, scorecards, and the strict 14-day SLA. Use when scheduling a candidate, when a hiring manager needs to know what stage to schedule next, or when a recruiter is debating exceptions to the take-home requirement.",
    topic: "hiring",
    factIds: ["fact-hiring-loop", "fact-hiring-takehome"],
    lastUpdatedAt: "2025-12-31T22:30:00Z",
    body: `# Running the Engineering Hiring Loop

## Loop stages

1. Recruiter screen (30 min) — Priya
2. Hiring manager intro (45 min)
3. Take-home (4 hr cap, paid \$200 for senior+)
4. Onsite — 4 sessions, 1 day:
   - Coding pair (90 min)
   - System design (60 min, senior+ only)
   - Cross-functional / behavioral (45 min)
   - Founder chat (30 min, leveling)
5. Debrief same day, decision within 48 hours.

## Hard rules

- **No candidate skips the take-home.** Even ex-FAANG referrals. We've been burned twice.
- **Loop must finish < 14 days from screen to offer.** We've lost candidates over slow loops.

## Source

Slack #hiring (Marco Silva, Dec 2025) + Notion → Hiring → Eng Loop 2026.`,
  },

  {
    name: "responding-to-press",
    description:
      "Routes inbound press, journalist, or analyst inquiries through Northwind's centralized comms process. Use when a journalist DMs or emails an employee, when someone wants to comment on industry news, or when an analyst (Forrester, G2, Gartner) reaches out.",
    topic: "comms",
    factIds: ["fact-press-policy"],
    lastUpdatedAt: "2026-01-31T03:15:00Z",
    body: `# Responding to Press / Analysts

## Hard rule

**Forward all press, journalist, and analyst inquiries to Priya Shah (priya@northwind.com) or ceo@northwind.com.**

This includes:
- Press inquiries via email
- Journalist DMs on LinkedIn or X
- Analyst inquiries (Forrester, G2, Gartner, etc.)

## Do not

- Reply directly, even with "no comment".
- Forward the inquiry to the journalist saying "talk to Priya" — let Priya reach out.

## Why

Centralized comms ensures we don't accidentally leak material info pre-announcement, and that our messaging is consistent.

## Source

Slack #comms (Priya Shah, Jan 2026).`,
  },
];

export function getSkillByName(name: string): AgentSkill | undefined {
  return NORTHWIND_SKILLS.find((s) => s.name === name);
}

export function getRelevantSkillsForPrompt(prompt: string): AgentSkill[] {
  const p = prompt.toLowerCase();
  const matches: AgentSkill[] = [];
  for (const skill of NORTHWIND_SKILLS) {
    const desc = skill.description.toLowerCase();
    const topic = skill.topic.toLowerCase();
    // Heuristic keyword match (the live agent uses Claude to pick more carefully)
    const keywords = [
      ...desc.split(/[\s,.;:]+/),
      ...topic.split("-"),
      ...skill.name.split("-"),
    ].filter((w) => w.length > 4);
    if (keywords.some((k) => p.includes(k))) {
      matches.push(skill);
    }
  }
  return matches;
}
