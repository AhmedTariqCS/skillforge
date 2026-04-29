"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to a real error tracker in production
    console.error("Skillforge error boundary caught:", error);
  }, [error]);

  return (
    <main className="flex-1 w-full flex items-center justify-center px-6 py-24 min-h-[60vh]">
      <div className="max-w-md w-full text-center">
        <p className="text-xs uppercase tracking-wider text-red-400 font-medium mb-4">
          Something went wrong
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 leading-tight">
          The brain hit a snag.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-2">
          We&apos;ve logged it and we&apos;ll look at it. In the meantime:
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-muted-foreground/70 mb-6">
            digest: {error.digest}
          </p>
        )}
        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={() => reset()} size="lg" className="w-full">
            <RefreshCw className="size-4" /> Try again
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full">
            <Link href="/">
              <Home className="size-4" /> Back to home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
