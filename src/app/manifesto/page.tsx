import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Manifesto — Skillforge",
  description:
    "Why the company brain is the missing layer between AI agents and real work.",
};

export default function ManifestoPage() {
  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24 flex-1 w-full">
        <p className="text-xs uppercase tracking-wider text-primary mb-3 font-medium">
          Manifesto
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-10 leading-[1.1]">
          The model isn&apos;t the bottleneck.
          <br />
          <span className="text-muted-foreground">The knowledge is.</span>
        </h1>

        <div className="space-y-6 text-base leading-relaxed text-foreground/85">
          <p>
            For two years, the conversation was about model quality. Each
            release closed the gap on what AI could do in principle. Now
            anyone deploying agents into a real company workflow runs into the
            same wall, in the same week:
          </p>
          <p className="text-foreground font-medium">
            The model is brilliant, and it has no idea how your company works.
          </p>
          <p>
            It doesn&apos;t know that the refund cap was lifted last month for
            Enterprise customers. It doesn&apos;t know the AE matrix gives 25%
            below 250 seats. It doesn&apos;t know that restarting payment pods
            once double-charged forty customers and that&apos;s why we don&apos;t
            do it anymore. None of that is in the model. None of that is in
            any vector database. It&apos;s in two-year-old Slack threads, in a
            Notion doc that was last edited eighteen months ago, in a
            post-mortem nobody re-reads, and in one engineer&apos;s head.
          </p>
          <p>
            Tribal knowledge is the operating system of every company. It runs
            silently in the background until you try to automate something
            against it. Then you find it everywhere, and it&apos;s incoherent.
          </p>
          <h2 className="text-2xl font-semibold tracking-tight pt-6">
            What we&apos;re building
          </h2>
          <p>
            A company brain that pulls knowledge out of Slack, Notion, Google
            Drive, GitHub, Intercom, and Linear; structures it into
            machine-checkable facts with provenance; and synthesizes it into
            executable skills that AI agents actually run. Not embeddings.
            Not RAG over docs. <strong className="text-foreground">Skills</strong>{" "}
            — the same primitive Anthropic ships with Claude — but generated
            from your company&apos;s own history.
          </p>
          <p>
            A SKILL.md isn&apos;t a chatbot pretending to know your policies.
            It&apos;s a versioned, reviewable, auditable playbook that an
            agent loads when relevant and runs deterministically. It encodes
            the hard-won lessons that would otherwise live in someone&apos;s
            head until they leave.
          </p>
          <h2 className="text-2xl font-semibold tracking-tight pt-6">
            What we believe
          </h2>
          <ul className="space-y-3 list-none pl-0">
            <li>
              <strong className="text-foreground">Provenance, not vibes.</strong>{" "}
              Every fact in the brain is traceable to the Slack message, doc,
              or commit it came from. Hallucinations aren&apos;t a model
              problem — they&apos;re a sourcing problem.
            </li>
            <li>
              <strong className="text-foreground">
                Hard rules survive humans.
              </strong>{" "}
              The reason &ldquo;don&apos;t restart payments pods&rdquo; is a
              hard rule is that someone learned it the bad way. That lesson
              should outlive that person&apos;s tenure. It should be a skill.
            </li>
            <li>
              <strong className="text-foreground">
                Living, not snapshotted.
              </strong>{" "}
              The brain re-extracts when the underlying sources change. Stale
              policy is worse than no policy. We monitor the sources directly
              and republish skills.
            </li>
            <li>
              <strong className="text-foreground">
                Action, not retrieval.
              </strong>{" "}
              A pile of documents an agent could quote isn&apos;t a brain.
              Skills tell agents <em>what to do</em>, not just <em>what is
              true</em>.
            </li>
          </ul>
          <h2 className="text-2xl font-semibold tracking-tight pt-6">
            Why now
          </h2>
          <p>
            Three things became true in the same six months. Models got good
            enough to take real action. Anthropic shipped Skills as a real
            primitive. And every company that put an agent into production hit
            the knowledge wall and started looking for what we&apos;re
            building.
          </p>
          <p>
            Tom Blomfield put it on YC&apos;s 2026 RFS:
          </p>
          <blockquote className="border-l-2 border-primary/60 pl-6 text-foreground/90 italic">
            &ldquo;The biggest blocker to AI automation of companies is no longer
            the models. Now the blocker is the domain knowledge. We need a new
            primitive: a company brain. Every company in the world is going to
            need one.&rdquo;
          </blockquote>
          <p>He&apos;s right. We&apos;re building it.</p>

          <div className="pt-10 mt-10 border-t border-border/60 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 h-11 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Run the live demo →
            </Link>
            <Link
              href="/forge"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 h-11 text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              Try the live compiler
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 h-11 text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              About the founder
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
