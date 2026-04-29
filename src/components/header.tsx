import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  variant?: "marketing" | "app";
}

export function Header({ variant = "marketing" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/demo" className="hover:text-foreground transition-colors">
            Demo
          </Link>
          <Link href="/forge" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            Forge
            <span className="text-[9px] font-medium text-primary border border-primary/40 rounded px-1 py-0.5 leading-none">
              live
            </span>
          </Link>
          <Link href="/connectors" className="hover:text-foreground transition-colors">
            Connectors
          </Link>
          <Link href="/install" className="hover:text-foreground transition-colors">
            CLI
          </Link>
          <Link href="/registry" className="hover:text-foreground transition-colors">
            Registry
          </Link>
          <Link href="/research" className="hover:text-foreground transition-colors">
            Research
          </Link>
          <Link href="/manifesto" className="hover:text-foreground transition-colors">
            Manifesto
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {variant === "marketing" ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/demo">Try the demo</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/#waitlist">Join waitlist</Link>
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
            )}
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
