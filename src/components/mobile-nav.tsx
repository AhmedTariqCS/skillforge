"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const LINKS = [
  { href: "/demo", label: "Demo" },
  { href: "/forge", label: "Forge", live: true },
  { href: "/connectors", label: "Connectors" },
  { href: "/install", label: "CLI" },
  { href: "/skills", label: "Skills" },
  { href: "/registry", label: "Registry" },
  { href: "/research", label: "Research" },
  { href: "/sources", label: "Sources" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between px-6 h-14 border-b border-border">
            <span className="text-base font-semibold tracking-tight">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </Button>
          </div>
          <nav className="px-6 pt-6 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 py-3 text-base text-foreground hover:text-primary transition-colors border-b border-border/40"
              >
                {l.label}
                {l.live && (
                  <span className="text-[9px] font-medium text-primary border border-primary/40 rounded px-1 py-0.5 leading-none">
                    live
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/#waitlist"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground py-3 text-base font-medium"
            >
              Join the waitlist
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
