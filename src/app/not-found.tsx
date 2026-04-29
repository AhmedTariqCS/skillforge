import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Hammer, Sparkles } from "lucide-react";

export const metadata = {
  title: "Not found — Skillforge",
};

export default function NotFound() {
  return (
    <>
      <Header variant="app" />
      <main className="flex-1 w-full flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center">
          <p className="text-xs uppercase tracking-wider text-primary font-medium mb-4">
            404
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 leading-tight">
            That skill isn&apos;t in the brain.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            The page you&apos;re looking for doesn&apos;t exist — or
            hasn&apos;t been compiled yet. Try one of these instead:
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild size="lg" className="w-full">
              <Link href="/demo">
                <Sparkles className="size-4" /> Run the live demo
                <ArrowRight className="size-4 ml-auto" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href="/forge">
                <Hammer className="size-4" /> Try the live compiler
                <ArrowRight className="size-4 ml-auto" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="w-full">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
