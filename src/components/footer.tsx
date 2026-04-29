import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-muted-foreground max-w-md">
            The company brain for AI agents. Built for YC Summer 2026.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/demo" className="hover:text-foreground transition-colors">
            Demo
          </Link>
          <Link href="/forge" className="hover:text-foreground transition-colors">
            Forge
          </Link>
          <Link href="/install" className="hover:text-foreground transition-colors">
            CLI
          </Link>
          <Link href="/skills" className="hover:text-foreground transition-colors">
            Skills
          </Link>
          <Link href="/sources" className="hover:text-foreground transition-colors">
            Sources
          </Link>
          <Link href="/research" className="hover:text-foreground transition-colors">
            Research
          </Link>
          <Link href="/manifesto" className="hover:text-foreground transition-colors">
            Manifesto
          </Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <a
            href="https://www.ycombinator.com/rfs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            YC RFS
          </a>
        </div>
      </div>
    </footer>
  );
}
