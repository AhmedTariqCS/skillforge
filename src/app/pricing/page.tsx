import Link from "next/link";
import { Check, ArrowRight, Building2, Rocket, Users } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pricing — Skillforge",
  description:
    "Per-company pricing for the company brain. Starter, Growth, and Enterprise.",
};

interface Tier {
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  icon: React.ReactNode;
  highlight?: boolean;
  features: string[];
  cta: { label: string; href: string };
  footnote?: string;
}

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "$2,000",
    cadence: "/ month",
    blurb: "For startups deploying their first agent into production.",
    icon: <Rocket className="size-5" />,
    features: [
      "1 connected source (Slack, Notion, Drive, GitHub, or Intercom)",
      "Up to 50 generated skills",
      "Up to 100 employees in scope",
      "Daily re-extraction",
      "Provenance trail on every fact",
      "Claude Agent Skills format export",
      "Email support",
    ],
    cta: { label: "Start free pilot", href: "/#waitlist" },
    footnote: "First 30 days free for YC and design partners.",
  },
  {
    name: "Growth",
    price: "$8,000",
    cadence: "/ month",
    blurb: "For Series A–B teams with multiple agents in production.",
    icon: <Users className="size-5" />,
    highlight: true,
    features: [
      "Up to 5 connected sources",
      "Up to 250 generated skills",
      "Up to 500 employees in scope",
      "Hourly re-extraction + change-driven sync",
      "Conflict detection across sources",
      "Skill versioning + review workflows",
      "SSO via Okta or Google Workspace",
      "Audit log + compliance export",
      "Priority Slack channel with the team",
    ],
    cta: { label: "Start free pilot", href: "/#waitlist" },
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "starts at $50k / yr",
    blurb: "For organizations running agents across the company.",
    icon: <Building2 className="size-5" />,
    features: [
      "Unlimited sources, skills, and employees",
      "Real-time sync (no batch lag)",
      "Custom connectors (your internal tools)",
      "On-prem / VPC deployment available",
      "RBAC, SCIM, audit log retention",
      "Dedicated extraction tuning",
      "Solutions engineer + SLA",
      "Procurement + DPA / SOC 2 reports",
    ],
    cta: { label: "Talk to founders", href: "/#waitlist" },
  },
];

export default function PricingPage() {
  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-6xl px-6 pt-16 pb-16 flex-1 w-full">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <Badge variant="muted" className="mb-3">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 leading-tight">
            Priced per company,
            <br />
            <span className="text-muted-foreground">not per seat.</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Your knowledge belongs to your company, so does your brain. We
            don&apos;t charge per employee who uses it. We charge for the depth
            of your sources, the volume of skills, and the speed of sync.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-16">
          {TIERS.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-8 mb-16">
          <h2 className="text-xl font-semibold tracking-tight mb-6">
            FAQ
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Faq
              q="Why per-company instead of per-seat?"
              a="Because the value is the brain itself, not how many people read it. A 50-person startup deploying 20 agents gets the same value as a 500-person company deploying the same agents. Per-seat pricing punishes adoption — exactly the wrong incentive."
            />
            <Faq
              q="What counts as a 'source'?"
              a="A source is one connected system: your Slack workspace, your Notion workspace, your Google Drive, etc. Multiple Slack channels in the same workspace count as one source."
            />
            <Faq
              q="Do you train models on our data?"
              a="No. Skillforge runs Claude inference on your data via Anthropic's API. Anthropic has standard data retention; nothing trains on your data. We can run with Zero Data Retention on Enterprise."
            />
            <Faq
              q="Where does the data live?"
              a="By default, US-East. EU and Canadian residency available on Enterprise. On-prem / VPC deployment supported on Enterprise — your data never leaves your network."
            />
            <Faq
              q="What does the 30-day free pilot include?"
              a="Full Starter or Growth functionality. We work with you to identify 3–5 high-value workflows, generate the skills, and validate them with your team before you decide to convert."
            />
            <Faq
              q="Can we self-host?"
              a="Yes — Enterprise customers can run Skillforge in their own VPC. The extraction pipeline runs on your infra, calling Anthropic directly. We support AWS, GCP, and Azure."
            />
          </div>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Pilot us this batch.
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            We&apos;re onboarding our first 10 design partners now. Free pilot,
            real product, founder-led implementation.
          </p>
          <Button asChild size="lg">
            <Link href="/#waitlist">
              Get on the list <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`rounded-xl border p-6 flex flex-col ${
        tier.highlight
          ? "border-primary/40 bg-card relative shadow-2xl shadow-primary/5"
          : "border-border bg-card/60"
      }`}
    >
      {tier.highlight && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Badge variant="default" className="text-[10px]">
            Most popular
          </Badge>
        </div>
      )}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`size-10 rounded-lg flex items-center justify-center ${
            tier.highlight
              ? "bg-primary/15 text-primary"
              : "bg-muted text-foreground"
          }`}
        >
          {tier.icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight">{tier.name}</h3>
      </div>
      <div className="mb-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight">
          {tier.price}
        </span>
        <span className="text-sm text-muted-foreground">{tier.cadence}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {tier.blurb}
      </p>
      <Button
        asChild
        size="lg"
        variant={tier.highlight ? "default" : "outline"}
        className="mb-6 w-full"
      >
        <Link href={tier.cta.href}>{tier.cta.label}</Link>
      </Button>
      <ul className="flex-1 space-y-2.5 mb-4">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check
              className={`size-4 mt-0.5 shrink-0 ${
                tier.highlight ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span className="text-foreground/90 leading-snug">{f}</span>
          </li>
        ))}
      </ul>
      {tier.footnote && (
        <p className="text-xs text-muted-foreground border-t border-border/60 pt-4 mt-auto">
          {tier.footnote}
        </p>
      )}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <p className="text-sm font-semibold mb-1.5">{q}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
    </div>
  );
}
