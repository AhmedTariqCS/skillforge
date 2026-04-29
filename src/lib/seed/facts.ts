import type { ExtractedFact } from "../types";

// Pre-extracted facts. In production these come from the live extraction
// pipeline (lib/extract.ts) — here we ship the result so the demo loads
// instantly. Each fact has provenance: which doc(s) it came from, plus
// confidence and supersession info.

export const NORTHWIND_FACTS: ExtractedFact[] = [
  // ----- Refunds -----
  {
    id: "fact-refund-policy-v3",
    type: "policy",
    topic: "refunds",
    statement:
      "Refund Policy v3 is current (effective April 8 2026). Within 30 days: full refund any plan. 30-90 days: pro-rated refund Starter/Growth, full refund Enterprise. After 90 days: service credit only Starter/Growth, pro-rated credit max 6 months for Enterprise.",
    evidence: [
      {
        docId: "notion-refund-policy-v3",
        quote: "This supersedes v2 (which capped refunds at $5k regardless of plan).",
        confidence: 0.98,
      },
      {
        docId: "slack-cs-policies-2026-04-08",
        quote:
          "I just published Refund Policy v3. The big change: we're removing the $5k hard cap for Enterprise customers.",
        confidence: 0.96,
      },
    ],
    validFrom: "2026-04-08T00:00:00Z",
  },
  {
    id: "fact-refund-authority",
    type: "policy",
    topic: "refunds",
    statement:
      "Refund authority: CSM ≤ $2,500; VP CS (Sarah Chen) for $2,500-$25,000; CFO above $25,000.",
    evidence: [
      {
        docId: "notion-refund-policy-v3",
        quote: "CSMs can approve refunds up to $2,500 without escalation.",
        confidence: 0.99,
      },
      {
        docId: "slack-cs-policies-2026-04-08",
        quote: "CSM up to $2,500 unilaterally, me up to $25k, CFO above.",
        confidence: 0.97,
      },
    ],
  },
  {
    id: "fact-refund-template",
    type: "procedure",
    topic: "refunds",
    statement:
      "Refunds are logged in Salesforce using template RFND-2026 (RFND-2025 is archived). Cash refunds via Stripe; service credits via NetSuite — never both.",
    evidence: [
      {
        docId: "notion-refund-policy-v3",
        quote:
          "Process via Stripe (refund) or NetSuite (credit memo) — never both.",
        confidence: 0.95,
      },
      {
        docId: "slack-cs-policies-2026-04-08",
        quote: "Just make sure RFND-2026 SF template is updated, not RFND-2025.",
        confidence: 0.93,
      },
    ],
  },

  // ----- Pricing -----
  {
    id: "fact-discount-ladder",
    type: "policy",
    topic: "pricing",
    statement:
      "AE-authorized discount ladder: <25 seats 0%, 25-99 15%, 100-249 25%, 250+ 30%.",
    evidence: [
      {
        docId: "notion-pricing-exceptions",
        quote:
          "100–249 seats: Up to 25% AE-approved. 250+ seats: Up to 30% AE-approved.",
        confidence: 0.99,
      },
    ],
  },
  {
    id: "fact-multiyear-boost",
    type: "policy",
    topic: "pricing",
    statement:
      "Multi-year boost stacks on the seat-tier discount: +5% for 2-year prepay, +8% for 3-year prepay.",
    evidence: [
      {
        docId: "notion-pricing-exceptions",
        quote:
          "Add +5% for 2-year prepay, +8% for 3-year prepay. Stacks on the seat-tier discount above.",
        confidence: 0.99,
      },
    ],
  },
  {
    id: "fact-discount-floor",
    type: "constraint",
    topic: "pricing",
    statement:
      "40% off list is the absolute floor — anything more aggressive requires CFO sign-off.",
    evidence: [
      {
        docId: "notion-pricing-exceptions",
        quote:
          "40% off list is the floor. We do not go below that without CFO sign-off",
        confidence: 0.99,
      },
    ],
  },
  {
    id: "fact-disc-approved-techcorp",
    type: "decision",
    topic: "pricing",
    statement:
      "TechCorp deal Mar 2026: 35% / 150 seats / 2-year prepay APPROVED by Maya Okafor based on Zendesk displacement and written internal champion memo.",
    evidence: [
      {
        docId: "slack-sales-ops-2026-03-14",
        quote: "Approved. 35% / 150 / 2-year prepay.",
        confidence: 0.97,
      },
      {
        docId: "notion-pricing-exceptions",
        quote:
          "TechCorp (Mar 2026): 35% / 150 seats / 2-year prepay. Approved by Maya, justified by displacement of Zendesk.",
        confidence: 0.95,
      },
    ],
  },
  {
    id: "fact-disc-rejected-lumen",
    type: "decision",
    topic: "pricing",
    statement:
      "Lumen Labs Jan 2026: initial 38% / 80 seats / 3-year ask was REJECTED. Counter at 28% closed the deal.",
    evidence: [
      {
        docId: "slack-cs-discount-comp",
        quote:
          "Rejected. 38% on 80 seats sets a bad precedent — we'd have to extend it down-market. Counter at 28%",
        confidence: 0.97,
      },
    ],
  },

  // ----- Incidents -----
  {
    id: "fact-no-pod-restart-payments",
    type: "constraint",
    topic: "incidents",
    statement:
      "HARD RULE: do NOT restart payments-svc pods to clear queue depth. Stripe has already acked in-flight webhooks; restarting causes duplicate charges. Scale out via HPA instead.",
    evidence: [
      {
        docId: "github-pm-2025-04-15",
        quote:
          "During a routine queue-depth spike, on-call restarted the payments-svc deployment to clear the queue. ... 40 customers double-charged.",
        confidence: 0.99,
      },
      {
        docId: "notion-incident-runbook",
        quote:
          "Hard rule. Last incident (Feb 14, 2026) restarting payments-svc pods caused 30 minutes of dropped Stripe webhook retries.",
        confidence: 0.99,
      },
      {
        docId: "slack-payments-incident-2026-02-14",
        quote: "Do not restart payments-svc pods.",
        confidence: 0.99,
      },
    ],
  },
  {
    id: "fact-payments-hpa",
    type: "procedure",
    topic: "incidents",
    statement:
      "On payments queue backup, scale out by bumping HPA max (currently 32). Was bumped from 12 → 24 during PM-2026-02-14, then to 32 in action item.",
    evidence: [
      {
        docId: "github-pm-2026-02-14",
        quote: "Bump payments-svc HPA max to 32 (David, done 2026-02-15).",
        confidence: 0.96,
      },
    ],
  },
  {
    id: "fact-payments-escalation",
    type: "person",
    topic: "incidents",
    statement:
      "Payments / billing escalation: David Park (primary), Aisha Rahman (backup).",
    evidence: [
      {
        docId: "notion-incident-runbook",
        quote: "Payments / billing: David Park (primary), Aisha Rahman (backup)",
        confidence: 0.99,
      },
    ],
  },
  {
    id: "fact-incident-severity",
    type: "policy",
    topic: "incidents",
    statement:
      "SEV1 = customer-facing outage / data loss / security. SEV2 = major degradation (P95 latency 2x baseline, partial outage). SEV3 = cosmetic, no customer impact. Status page only for SEV1, or SEV2 lasting > 60 min.",
    evidence: [
      {
        docId: "notion-incident-runbook",
        quote:
          "SEV1: Customer-facing outage, data loss, or security incident. SEV2: Major degradation",
        confidence: 0.97,
      },
    ],
  },

  // ----- Other -----
  {
    id: "fact-health-scoring",
    type: "policy",
    topic: "customer-success",
    statement:
      "Customer health score (0-100) = Usage 40 + Engagement 20 + Renewal 20 + Support 20. Green ≥80, Yellow 60-79, Red <60.",
    evidence: [
      {
        docId: "notion-csm-playbook",
        quote: "Usage (40 pts) ... Engagement (20 pts) ... Renewal signal (20 pts)",
        confidence: 0.98,
      },
    ],
  },
  {
    id: "fact-procurement-thresholds",
    type: "policy",
    topic: "procurement",
    statement:
      "Software purchase approval: <$1.2k manager, $1.2k-$10k VP, $10k-$50k CFO, >$50k CFO+CEO.",
    evidence: [
      {
        docId: "notion-procurement",
        quote:
          "$1,200–$10k VP of function | $10k–$50k CFO | > $50k CFO + CEO",
        confidence: 0.99,
      },
    ],
  },
  {
    id: "fact-procurement-redflags",
    type: "constraint",
    topic: "procurement",
    statement:
      "Vendor red flags (do not sign): no SOC 2 Type II, no SSO on enterprise tier, data residency outside US/EU/CA, missing subprocessor list.",
    evidence: [
      {
        docId: "notion-procurement",
        quote: "Vendor red flags (do not sign)",
        confidence: 0.97,
      },
    ],
  },
  {
    id: "fact-hiring-loop",
    type: "procedure",
    topic: "hiring",
    statement:
      "Engineering hiring loop: recruiter screen → HM intro → take-home → onsite (4 sessions) → debrief same day → decision within 48 hours. Total < 14 days.",
    evidence: [
      {
        docId: "slack-hiring-loop",
        quote: "Loop length needs to be < 14 days from screen to offer.",
        confidence: 0.95,
      },
    ],
  },
  {
    id: "fact-hiring-takehome",
    type: "constraint",
    topic: "hiring",
    statement:
      "No engineering candidate skips the take-home. No exceptions, even for ex-FAANG referrals.",
    evidence: [
      {
        docId: "slack-hiring-loop",
        quote:
          "Hard rule: no candidate skips take-home. No exceptions even for ex-FAANG referrals. We've been burned twice.",
        confidence: 0.99,
      },
    ],
  },
  {
    id: "fact-press-policy",
    type: "policy",
    topic: "comms",
    statement:
      "All press, journalist, and analyst inquiries must be forwarded to Priya Shah or ceo@northwind.com. Do not respond directly, even with no comment.",
    evidence: [
      {
        docId: "slack-comms-pr-policy",
        quote:
          "Please do NOT respond directly to press inquiries. Forward all of them to me or to ceo@northwind.com.",
        confidence: 0.99,
      },
    ],
  },
];

export function getFactsByTopic(topic: string): ExtractedFact[] {
  return NORTHWIND_FACTS.filter((f) => f.topic === topic);
}

export function getFactsByIds(ids: string[]): ExtractedFact[] {
  return NORTHWIND_FACTS.filter((f) => ids.includes(f.id));
}
