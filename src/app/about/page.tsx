import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About — Skillforge",
  description:
    "Why a CS student from Guelph is building the company brain for AI agents.",
};

export default function AboutPage() {
  return (
    <>
      <Header variant="app" />
      <main className="mx-auto max-w-2xl px-6 pt-16 pb-24 flex-1 w-full">
        <Badge variant="muted" className="mb-3">
          About
        </Badge>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3 leading-[1.1]">
          One founder, one obsession.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed mb-12">
          Skillforge is built by Ahmed Tariq. This is the story of why.
        </p>

        <article className="space-y-6 text-base leading-relaxed text-foreground/90">
          <p>
            I&apos;m a computer science student at the University of Guelph.
            Over the last three years I worked co-ops at three companies that
            could not be more different from each other:
          </p>

          <ul className="space-y-3 list-none pl-0 my-6">
            <Item
              title="CGI"
              detail="One of the largest IT consultancies in the world. I worked on enterprise systems for clients you&apos;d recognize."
            />
            <Item
              title="Scotiabank"
              detail="A Canadian top-five bank. Heavily regulated, heavily process-driven, three layers of approval for everything."
            />
            <Item
              title="Bombardier"
              detail="Trains and business jets. The kind of company where a single document can take a year to update because lives depend on it."
            />
          </ul>

          <p>
            Three different industries. Three different cultures. One pattern,
            unmistakable in every single one:
          </p>

          <p className="text-lg font-medium text-foreground border-l-2 border-primary/60 pl-6 py-2">
            The company runs on knowledge that lives in people&apos;s heads, in
            old emails, in Slack threads from two years ago, in Confluence
            pages last edited by someone who left in 2023.
          </p>

          <p>
            Onboarding a new engineer at any of these companies took months,
            not because the work was hard, but because the documented playbook
            was thirty percent of what you actually needed to know. The other
            seventy percent was &ldquo;ask Sarah,&rdquo; or &ldquo;there&apos;s
            a thread from last March, let me find it,&rdquo; or &ldquo;here&apos;s
            a guy I should introduce you to.&rdquo;
          </p>

          <p>
            That&apos;s the operating system of every real company. Tribal
            knowledge. It works because humans are good at vague pattern
            recognition over years. It breaks the moment you try to put an AI
            agent into the same workflow.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight pt-8 mb-3">
            The wall
          </h2>

          <p>
            In early 2026, I started using Claude Code seriously. Like, every
            day. The agent is brilliant. Drop it into a fresh project and
            it&apos;s a senior engineer. Drop it into a real, ongoing,
            opinionated project and it&apos;s — well, a brilliant intern who
            needs context.
          </p>

          <p>
            I&apos;d ask it to do something against an internal-feeling
            workflow and it would give me a generic, textbook answer because
            it didn&apos;t know <em>our</em> refund matrix, <em>our</em>{" "}
            discount ladder, <em>our</em> incident runbook. The model
            wasn&apos;t the bottleneck. The knowledge was.
          </p>

          <p>
            I started writing Claude Skills by hand for my own projects. They
            worked instantly. The agent went from &ldquo;intern&rdquo; to
            &ldquo;senior who knows our codebase.&rdquo; But each skill took
            me hours to compile from scattered notes, threads, and old PRs. I
            was the compiler.
          </p>

          <p>
            That&apos;s when it clicked. The compiler is the product.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight pt-8 mb-3">
            Why solo, why now
          </h2>

          <p>
            I&apos;m applying to YC alone. I&apos;ve been deliberate about it.
            The right co-founder shows up after months of shipping, not at the
            application deadline. I&apos;d rather YC see a product I built
            alone than a team I assembled for the application.
          </p>

          <p>
            I built the live Skillforge MVP in five days, by myself. Real
            ingestion pipeline. Real Claude Agent Skills generator. Real
            streaming side-by-side demo. Real live compiler. The codebase is
            shipped, the demo is on, anyone can run it before reading my
            application.
          </p>

          <p>
            That&apos;s the velocity I&apos;ll bring to a YC batch. No
            coordination overhead. One person owning every decision. Every
            day shipping.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight pt-8 mb-3">
            Why this RFS
          </h2>

          <p>
            Tom Blomfield put the &ldquo;Company Brain&rdquo; problem on
            YC&apos;s Summer 2026 RFS. He&apos;s right that every company in
            the world is going to need one. He&apos;s right that the model
            isn&apos;t the bottleneck anymore.
          </p>

          <p>
            And I&apos;m not just going to build it because YC asked. I was
            building it before I read the RFS. The RFS is signal that the
            market is here. The product is what I was already going to ship.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight pt-8 mb-3">
            What you can do
          </h2>

          <p>
            If you&apos;re a YC partner reading this: please run the demo
            before reading my application. The product is the strongest part
            of my pitch.
          </p>

          <p>
            If you&apos;re a builder hitting the same wall: get on the
            waitlist. We&apos;re onboarding the first design partners now and
            I&apos;d love to talk to you.
          </p>

          <p>
            If you&apos;re someone who&apos;d be a great engineering hire:
            email me. We&apos;ll need help fast.
          </p>

          <div className="flex flex-wrap gap-3 pt-8">
            <Button asChild>
              <Link href="/demo">
                Try the demo <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/forge">Try the live forge</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/#waitlist">Join the waitlist</Link>
            </Button>
          </div>

          <p className="pt-8 text-sm text-muted-foreground italic border-t border-border/60 mt-12">
            — Ahmed Tariq, Guelph, Ontario · April 2026
            <br />
            ahmedtariqcs@gmail.com
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Item({ title, detail }: { title: string; detail: string }) {
  return (
    <li className="flex flex-col gap-0.5 rounded-lg border border-border bg-card/40 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
    </li>
  );
}
